import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { TaskJournal } from "../src/journal/TaskJournal";
import { CriticValidator } from "../src/dispatch/CriticValidator";
import { CriticReview, TaskRecord } from "../src/dispatch/types";

describe("Persistent SQLite/JSON Task Event Journal Suite", () => {
  let journal: TaskJournal;
  let tempDir: string;
  let tempFilePath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "corpai-journal-test-"));
    tempFilePath = path.join(tempDir, "task-events.jsonl");

    journal = new TaskJournal({
      journalPath: tempFilePath,
      inMemory: false,
      autoFlush: true,
      verifyOnLoad: true,
    });
  });

  afterEach(() => {
    journal.close();
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup error
    }
  });

  test("should append events with monotonic sequence numbers and SHA-256 hash chains", () => {
    const e1 = journal.appendSync({
      type: "TASK_DISPATCHED",
      taskId: "task-001",
      department: "Engineering",
      payload: { title: "Refactor Authentication Gateway", priority: "P1" },
    });

    const e2 = journal.appendSync({
      type: "TASK_ASSIGNED",
      taskId: "task-001",
      agentId: "agent-secops",
      department: "Engineering",
      payload: { assignedWorkerId: "agent-secops", assignedCriticId: "critic-auditor" },
    });

    const e3 = journal.appendSync({
      type: "TASK_COMPLETED",
      taskId: "task-001",
      agentId: "agent-secops",
      department: "Engineering",
      payload: { status: "completed", result: "Auth refactor complete" },
    });

    expect(e1.seq).toBe(1);
    expect(e2.seq).toBe(2);
    expect(e3.seq).toBe(3);

    // Verify hash linking: e2.prevHash === e1.hash && e3.prevHash === e2.hash
    expect(e2.prevHash).toBe(e1.hash);
    expect(e3.prevHash).toBe(e2.hash);

    expect(journal.size).toBe(3);
    expect(journal.getLatestSequence()).toBe(3);
    expect(journal.getLatestHash()).toBe(e3.hash);
  });

  test("should verify integrity of valid journal stream", () => {
    journal.appendSync({
      type: "TASK_DISPATCHED",
      taskId: "task-alpha",
      payload: { title: "Alpha Task" },
    });

    journal.appendSync({
      type: "TASK_RUNNING",
      taskId: "task-alpha",
      agentId: "agent-1",
      payload: { progress: 50 },
    });

    const integrity = journal.verifyIntegrity();
    expect(integrity.valid).toBe(true);
    expect(integrity.totalEvents).toBe(2);
    expect(integrity.corruptedEntries.length).toBe(0);
    expect(integrity.signatureFailures.length).toBe(0);
  });

  test("should detect corrupted or tampered entries in audit log", () => {
    journal.appendSync({
      type: "TASK_DISPATCHED",
      taskId: "task-100",
      payload: { title: "Secure Task" },
    });

    journal.appendSync({
      type: "TASK_COMPLETED",
      taskId: "task-100",
      payload: { result: "Original untampered output" },
    });

    // Tamper with in-memory entry payload directly
    const entry2 = journal.getEntryBySeq(2)!;
    (entry2 as any).payload = { result: "MALICIOUS HACKED OUTPUT" };

    const integrity = journal.verifyIntegrity();
    expect(integrity.valid).toBe(false);
    expect(integrity.corruptedEntries.length).toBeGreaterThan(0);
    expect(integrity.corruptedEntries[0].reason).toContain("Hash mismatch");
  });

  test("should record and verify cryptographic critic signatures", () => {
    const secretKey = "critic-super-secret-key-123";
    const taskId = "task-critic-audit";
    const workerId = "agent-worker-1";
    const criticId = "critic-auditor-1";

    journal.appendSync({
      type: "TASK_DISPATCHED",
      taskId,
      payload: { title: "Audited Deployment Task" },
    });

    const reviewData = {
      criticId,
      taskId,
      workerId,
      status: "approved" as const,
      score: 0.95,
      feedback: "Architecture satisfies security policies",
      timestamp: new Date().toISOString(),
      payloadHash: CriticValidator.hashPayload({ result: "Deployed v2.0" }),
    };

    const signedReview = CriticValidator.signReview(secretKey, reviewData);

    journal.appendSync({
      type: "CRITIC_REVIEWED",
      taskId,
      agentId: criticId,
      payload: signedReview,
      signature: signedReview.signature,
    });

    // Verify integrity with matching secret key resolver
    const reportValid = journal.verifyIntegrity((id) => (id === criticId ? secretKey : undefined));
    expect(reportValid.valid).toBe(true);
    expect(reportValid.signatureFailures.length).toBe(0);

    // Verify integrity fails with wrong secret key
    const reportInvalid = journal.verifyIntegrity(() => "wrong-tampered-secret-key");
    expect(reportInvalid.valid).toBe(false);
    expect(reportInvalid.signatureFailures.length).toBe(1);
    expect(reportInvalid.signatureFailures[0].criticId).toBe(criticId);
  });

  test("should replay task event log and accurately reconstruct TaskRecord state", () => {
    const taskId = "task-lifecycle-replay";

    journal.appendSync({
      type: "TASK_DISPATCHED",
      taskId,
      department: "Security",
      payload: {
        id: taskId,
        title: "Vulnerability Scan",
        priority: "P1",
        requiredCapabilities: ["sast", "dast"],
      },
    });

    journal.appendSync({
      type: "TASK_ASSIGNED",
      taskId,
      agentId: "agent-secops",
      department: "Security",
      payload: { assignedWorkerId: "agent-secops", assignedCriticId: "critic-sec" },
    });

    journal.appendSync({
      type: "TASK_RUNNING",
      taskId,
      agentId: "agent-secops",
      department: "Security",
      payload: { progress: 75 },
    });

    journal.appendSync({
      type: "TASK_RESULT_SUBMITTED",
      taskId,
      agentId: "agent-secops",
      department: "Security",
      payload: { result: { vulnerabilitiesFound: 0, scanClean: true } },
    });

    journal.appendSync({
      type: "TASK_COMPLETED",
      taskId,
      agentId: "agent-secops",
      department: "Security",
      payload: { status: "completed" },
    });

    const reconstructed = journal.replayTask(taskId);
    expect(reconstructed).not.toBeNull();
    expect(reconstructed?.id).toBe(taskId);
    expect(reconstructed?.title).toBe("Vulnerability Scan");
    expect(reconstructed?.priority).toBe("P1");
    expect(reconstructed?.department).toBe("Security");
    expect(reconstructed?.assignedWorkerId).toBe("agent-secops");
    expect(reconstructed?.assignedCriticId).toBe("critic-sec");
    expect(reconstructed?.status).toBe("completed");
    expect(reconstructed?.result).toEqual({ vulnerabilitiesFound: 0, scanClean: true });
  });

  test("should query events with filters, pagination, and sorting", () => {
    for (let i = 1; i <= 10; i++) {
      journal.appendSync({
        type: i % 2 === 0 ? "TASK_DISPATCHED" : "TOKEN_BUDGET_ALLOCATED",
        taskId: `task-${i}`,
        department: i <= 5 ? "Engineering" : "Operations",
        payload: { index: i },
      });
    }

    const engineeringEvents = journal.query({ department: "Engineering" });
    expect(engineeringEvents.length).toBe(5);

    const tokenAllocEvents = journal.query({ type: "TOKEN_BUDGET_ALLOCATED" });
    expect(tokenAllocEvents.length).toBe(5);

    const paged = journal.query({ limit: 3, offset: 2 });
    expect(paged.length).toBe(3);
    expect(paged[0].seq).toBe(3);
  });

  test("should create snapshot and restore state", () => {
    journal.appendSync({
      type: "TASK_DISPATCHED",
      taskId: "task-snap-1",
      department: "Engineering",
      payload: { title: "Task 1" },
    });

    journal.appendSync({
      type: "TASK_COMPLETED",
      taskId: "task-snap-1",
      payload: { result: "Done" },
    });

    const snapshotPath = path.join(tempDir, "snapshot-1.json");
    const snapshot = journal.createSnapshot(snapshotPath);

    expect(snapshot.snapshotSeq).toBe(2);
    expect(snapshot.tasks["task-snap-1"]).toBeDefined();
    expect(snapshot.tasks["task-snap-1"].status).toBe("completed");
    expect(fs.existsSync(snapshotPath)).toBe(true);
  });

  test("should export SQLite DDL schema and SQL INSERT statements", () => {
    journal.appendSync({
      type: "TASK_DISPATCHED",
      taskId: "task-sql",
      department: "Engineering",
      payload: { title: "SQL Export Test" },
    });

    const schema = journal.exportSqliteSchema();
    expect(schema).toContain("CREATE TABLE IF NOT EXISTS task_events");
    expect(schema).toContain("idx_task_events_hash");

    const inserts = journal.exportSqliteInsertStatements();
    expect(inserts.length).toBe(1);
    expect(inserts[0]).toContain("INSERT INTO task_events");
    expect(inserts[0]).toContain("task-sql");
  });

  test("should persist and reload events from disk on new instance", () => {
    journal.appendSync({
      type: "TASK_DISPATCHED",
      taskId: "task-disk-1",
      payload: { title: "Disk Persistence" },
    });
    journal.close();

    // Reopen journal pointing to same file
    const reloadedJournal = new TaskJournal({
      journalPath: tempFilePath,
      inMemory: false,
    });

    expect(reloadedJournal.size).toBe(1);
    const entry = reloadedJournal.getEntryBySeq(1);
    expect(entry?.taskId).toBe("task-disk-1");

    const integrity = reloadedJournal.verifyIntegrity();
    expect(integrity.valid).toBe(true);

    reloadedJournal.close();
  });
});
