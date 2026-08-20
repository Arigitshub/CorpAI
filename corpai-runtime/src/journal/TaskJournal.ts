import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { CriticReview, TaskPriority, TaskRecord, TaskStatus } from "../dispatch/types";
import { CriticValidator } from "../dispatch/CriticValidator";
import {
  CorruptedEntryReport,
  JournalEntry,
  JournalEventType,
  JournalFilter,
  JournalIntegrityReport,
  JournalSnapshot,
  SignatureFailureReport,
  TaskJournalOptions,
} from "./types";

export const GENESIS_PREV_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

export class TaskJournal extends EventEmitter {
  private readonly options: TaskJournalOptions;
  private readonly entries: JournalEntry[] = [];
  private readonly taskIndex = new Map<string, number[]>(); // taskId -> seq[]
  private readonly typeIndex = new Map<string, number[]>(); // type -> seq[]

  private currentSeq = 0;
  private latestHash = GENESIS_PREV_HASH;
  private fileDescriptor: number | null = null;
  private isClosed = false;

  constructor(options: TaskJournalOptions = {}) {
    super();

    this.options = {
      journalPath: options.journalPath,
      sqlitePath: options.sqlitePath,
      inMemory: options.inMemory ?? !options.journalPath,
      autoFlush: options.autoFlush ?? true,
      verifyOnLoad: options.verifyOnLoad ?? true,
    };

    if (this.options.journalPath && !this.options.inMemory) {
      this.initPersistence(this.options.journalPath);
    }
  }

  /**
   * Compute deterministic canonical SHA-256 hash for a journal entry
   */
  public static computeEntryHash(
    seq: number,
    prevHash: string,
    timestamp: string,
    type: JournalEventType,
    taskId: string | undefined,
    agentId: string | undefined,
    department: string | undefined,
    payload: unknown,
    signature: string | undefined
  ): string {
    const canonicalPayload = JSON.stringify(payload ?? null);
    const content = `${seq}|${prevHash}|${timestamp}|${type}|${taskId || ""}|${agentId || ""}|${department || ""}|${canonicalPayload}|${signature || ""}`;
    return crypto.createHash("sha256").update(content, "utf8").digest("hex");
  }

  /**
   * Initialize disk persistence, ensure parent directories exist, and load existing entries.
   */
  private initPersistence(journalPath: string): void {
    const fullPath = path.resolve(journalPath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(fullPath)) {
      this.loadFromFile(fullPath);
    }

    this.fileDescriptor = fs.openSync(fullPath, "a+");
  }

  /**
   * Load existing journal file from disk
   */
  private loadFromFile(fullPath: string): void {
    const content = fs.readFileSync(fullPath, "utf8");
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

    for (const line of lines) {
      try {
        const entry = JSON.parse(line) as JournalEntry;
        this.indexEntryInMemory(entry);
      } catch {
        // Skip corrupted lines on load or report
      }
    }

    if (this.options.verifyOnLoad && this.entries.length > 0) {
      const integrity = this.verifyIntegrity();
      if (!integrity.valid) {
        this.emit("warning", `Journal integrity warning on load: ${integrity.corruptedEntries.length} corrupted entries`);
      }
    }
  }

  /**
   * Append an event to the append-only journal synchronously.
   */
  public appendSync<T = unknown>(params: {
    type: JournalEventType;
    taskId?: string;
    agentId?: string;
    department?: string;
    payload: T;
    signature?: string;
    timestamp?: string;
  }): JournalEntry<T> {
    if (this.isClosed) {
      throw new Error("Cannot append to closed TaskJournal");
    }

    const seq = this.currentSeq + 1;
    const eventId = `evt-${crypto.randomBytes(8).toString("hex")}`;
    const timestamp = params.timestamp || new Date().toISOString();
    const prevHash = this.latestHash;
    const clonedPayload = params.payload !== undefined && params.payload !== null
      ? JSON.parse(JSON.stringify(params.payload))
      : params.payload;

    const hash = TaskJournal.computeEntryHash(
      seq,
      prevHash,
      timestamp,
      params.type,
      params.taskId,
      params.agentId,
      params.department,
      clonedPayload,
      params.signature
    );

    const entry: JournalEntry<T> = {
      seq,
      eventId,
      type: params.type,
      timestamp,
      taskId: params.taskId,
      agentId: params.agentId,
      department: params.department,
      payload: clonedPayload,
      signature: params.signature,
      prevHash,
      hash,
    };

    this.indexEntryInMemory(entry as JournalEntry);

    // Persist to disk if file is configured
    if (this.fileDescriptor !== null && !this.options.inMemory) {
      const serialized = JSON.stringify(entry) + "\n";
      fs.writeSync(this.fileDescriptor, serialized);
      if (this.options.autoFlush) {
        fs.fsyncSync(this.fileDescriptor);
      }
    }

    this.emit("event:appended", entry);
    return entry;
  }

  /**
   * Async append wrapper
   */
  public async append<T = unknown>(params: {
    type: JournalEventType;
    taskId?: string;
    agentId?: string;
    department?: string;
    payload: T;
    signature?: string;
    timestamp?: string;
  }): Promise<JournalEntry<T>> {
    return this.appendSync(params);
  }

  /**
   * Record entry into memory arrays and secondary indexes
   */
  private indexEntryInMemory(entry: JournalEntry): void {
    this.entries.push(entry);
    this.currentSeq = entry.seq;
    this.latestHash = entry.hash;

    // Index by taskId
    if (entry.taskId) {
      let taskSeqs = this.taskIndex.get(entry.taskId);
      if (!taskSeqs) {
        taskSeqs = [];
        this.taskIndex.set(entry.taskId, taskSeqs);
      }
      taskSeqs.push(entry.seq);
    }

    // Index by type
    let typeSeqs = this.typeIndex.get(entry.type);
    if (!typeSeqs) {
      typeSeqs = [];
      this.typeIndex.set(entry.type, typeSeqs);
    }
    typeSeqs.push(entry.seq);
  }

  /**
   * Query journal events with filtering, pagination, and sorting
   */
  public query(filter?: JournalFilter): JournalEntry[] {
    if (!filter) {
      return [...this.entries];
    }

    let candidates: JournalEntry[];

    // Fast-path: query by single taskId using index
    if (filter.taskId && typeof filter.taskId === "string") {
      const seqs = this.taskIndex.get(filter.taskId) || [];
      candidates = seqs.map((seq) => this.entries[seq - 1]).filter(Boolean);
    } else if (filter.type && typeof filter.type === "string") {
      const seqs = this.typeIndex.get(filter.type) || [];
      candidates = seqs.map((seq) => this.entries[seq - 1]).filter(Boolean);
    } else {
      candidates = this.entries;
    }

    let filtered = candidates.filter((entry) => {
      if (filter.taskId) {
        const matchTasks = Array.isArray(filter.taskId) ? filter.taskId : [filter.taskId];
        if (!entry.taskId || !matchTasks.includes(entry.taskId)) return false;
      }

      if (filter.type) {
        const matchTypes = Array.isArray(filter.type) ? filter.type : [filter.type];
        if (!matchTypes.includes(entry.type)) return false;
      }

      if (filter.agentId && entry.agentId !== filter.agentId) {
        return false;
      }

      if (filter.department && entry.department?.toLowerCase() !== filter.department.toLowerCase()) {
        return false;
      }

      if (filter.fromSeq !== undefined && entry.seq < filter.fromSeq) {
        return false;
      }

      if (filter.toSeq !== undefined && entry.seq > filter.toSeq) {
        return false;
      }

      if (filter.fromTimestamp && Date.parse(entry.timestamp) < Date.parse(filter.fromTimestamp)) {
        return false;
      }

      if (filter.toTimestamp && Date.parse(entry.timestamp) > Date.parse(filter.toTimestamp)) {
        return false;
      }

      return true;
    });

    if (filter.offset && filter.offset > 0) {
      filtered = filtered.slice(filter.offset);
    }

    if (filter.limit && filter.limit > 0) {
      filtered = filtered.slice(0, filter.limit);
    }

    return filtered;
  }

  /**
   * Get all chronological events for a specific task
   */
  public getEventsForTask(taskId: string): JournalEntry[] {
    return this.query({ taskId });
  }

  /**
   * Get single journal entry by sequence number (1-indexed)
   */
  public getEntryBySeq(seq: number): JournalEntry | undefined {
    if (seq < 1 || seq > this.entries.length) return undefined;
    return this.entries[seq - 1];
  }

  /**
   * Get current highest sequence number
   */
  public getLatestSequence(): number {
    return this.currentSeq;
  }

  /**
   * Get latest cryptographic hash
   */
  public getLatestHash(): string {
    return this.latestHash;
  }

  /**
   * Total number of events logged
   */
  public get size(): number {
    return this.entries.length;
  }

  /**
   * Comprehensive cryptographic audit & integrity check.
   * Verifies the entire hash chain and optional critic review signatures.
   */
  public verifyIntegrity(
    secretKeyResolver?: (criticId: string) => string | undefined
  ): JournalIntegrityReport {
    const corruptedEntries: CorruptedEntryReport[] = [];
    const signatureFailures: SignatureFailureReport[] = [];

    let expectedPrevHash = GENESIS_PREV_HASH;

    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      const expectedSeq = i + 1;

      // 1. Verify sequence order
      if (entry.seq !== expectedSeq) {
        corruptedEntries.push({
          seq: entry.seq,
          eventId: entry.eventId,
          expectedHash: entry.hash,
          actualHash: entry.hash,
          reason: `Invalid sequence index: expected ${expectedSeq}, got ${entry.seq}`,
        });
      }

      // 2. Verify prevHash link
      if (entry.prevHash !== expectedPrevHash) {
        corruptedEntries.push({
          seq: entry.seq,
          eventId: entry.eventId,
          expectedHash: expectedPrevHash,
          actualHash: entry.prevHash,
          reason: `Broken hash chain: expected prevHash ${expectedPrevHash.slice(0, 12)}..., got ${entry.prevHash.slice(0, 12)}...`,
        });
      }

      // 3. Verify entry content hash
      const computedHash = TaskJournal.computeEntryHash(
        entry.seq,
        entry.prevHash,
        entry.timestamp,
        entry.type,
        entry.taskId,
        entry.agentId,
        entry.department,
        entry.payload,
        entry.signature
      );

      if (computedHash !== entry.hash) {
        corruptedEntries.push({
          seq: entry.seq,
          eventId: entry.eventId,
          expectedHash: computedHash,
          actualHash: entry.hash,
          reason: `Hash mismatch: payload or metadata altered`,
        });
      }

      // 4. Verify cryptographic critic signature if present
      if (secretKeyResolver) {
        let review: CriticReview | undefined;
        if (entry.type === "CRITIC_REVIEWED") {
          review = entry.payload as CriticReview;
        } else if (entry.type === "TASK_COMPLETED" && (entry.payload as any)?.review) {
          review = (entry.payload as TaskRecord).review;
        }

        if (review && review.criticId && (entry.signature || review.signature)) {
          const secretKey = secretKeyResolver(review.criticId);
          if (secretKey) {
            const reviewToVerify: CriticReview = {
              ...review,
              signature: review.signature || entry.signature || "",
            };
            const isValidSig = CriticValidator.verifySignature(reviewToVerify, secretKey);
            if (!isValidSig) {
              signatureFailures.push({
                seq: entry.seq,
                taskId: entry.taskId,
                agentId: entry.agentId,
                criticId: review.criticId,
                reason: `HMAC signature verification failed for critic '${review.criticId}'`,
              });
            }
          }
        }
      }

      expectedPrevHash = entry.hash;
    }

    const isValid = corruptedEntries.length === 0 && signatureFailures.length === 0;

    return {
      valid: isValid,
      totalEvents: this.entries.length,
      firstSeq: this.entries.length > 0 ? 1 : 0,
      lastSeq: this.currentSeq,
      rootHash: this.latestHash,
      corruptedEntries,
      signatureFailures,
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Replay all task events for a specific task and reconstruct its exact state.
   */
  public replayTask(taskId: string): TaskRecord | null {
    const events = this.getEventsForTask(taskId);
    if (events.length === 0) return null;

    let task: TaskRecord | null = null;

    for (const evt of events) {
      const payload = evt.payload as any;

      switch (evt.type) {
        case "TASK_DISPATCHED": {
          task = {
            id: evt.taskId || payload.id,
            title: payload.title || "Untitled Task",
            description: payload.description || "",
            priority: (payload.priority || "P3") as TaskPriority,
            department: evt.department || payload.department || "Engineering",
            requiredCapabilities: payload.requiredCapabilities || [],
            status: "queued",
            assignedWorkerId: payload.assignedWorkerId,
            assignedCriticId: payload.assignedCriticId,
            payload: payload.payload ?? {},
            reviewHistory: [],
            retryCount: payload.retryCount || 0,
            maxRetries: payload.maxRetries || 3,
            createdAt: evt.timestamp,
            updatedAt: evt.timestamp,
          };
          break;
        }

        case "TASK_ASSIGNED": {
          if (!task) break;
          task.status = "assigned";
          task.assignedWorkerId = evt.agentId || payload.assignedWorkerId || task.assignedWorkerId;
          if (payload.assignedCriticId) task.assignedCriticId = payload.assignedCriticId;
          task.updatedAt = evt.timestamp;
          break;
        }

        case "TASK_RUNNING": {
          if (!task) break;
          task.status = "running";
          task.assignedWorkerId = evt.agentId || task.assignedWorkerId;
          task.updatedAt = evt.timestamp;
          break;
        }

        case "TASK_RESULT_SUBMITTED": {
          if (!task) break;
          task.status = "awaiting_critic";
          task.result = payload.result ?? payload;
          task.resultHash = payload.resultHash || CriticValidator.hashPayload(task.result);
          task.updatedAt = evt.timestamp;
          break;
        }

        case "CRITIC_REVIEWED": {
          if (!task) break;
          const review = payload as CriticReview;
          task.review = review;
          task.reviewHistory.push(review);
          task.updatedAt = evt.timestamp;
          break;
        }

        case "TASK_RETRIED": {
          if (!task) break;
          task.status = "changes_requested";
          task.retryCount += 1;
          task.updatedAt = evt.timestamp;
          break;
        }

        case "TASK_COMPLETED": {
          if (!task) break;
          task.status = "completed";
          task.completedAt = evt.timestamp;
          task.updatedAt = evt.timestamp;
          break;
        }

        case "TASK_FAILED": {
          if (!task) break;
          task.status = "failed";
          task.error = payload.error || payload.reason || "Task failed";
          task.updatedAt = evt.timestamp;
          break;
        }

        case "TASK_CANCELLED": {
          if (!task) break;
          task.status = "cancelled";
          task.cancelledAt = evt.timestamp;
          task.cancelReason = payload.reason || payload.cancelReason || "Cancelled";
          task.updatedAt = evt.timestamp;
          break;
        }
      }
    }

    return task;
  }

  /**
   * Reconstruct all tasks across the entire journal stream.
   */
  public replayAllTasks(): Map<string, TaskRecord> {
    const tasks = new Map<string, TaskRecord>();
    const taskIds = Array.from(this.taskIndex.keys());

    for (const taskId of taskIds) {
      const task = this.replayTask(taskId);
      if (task) {
        tasks.set(taskId, task);
      }
    }

    return tasks;
  }

  /**
   * Create a state snapshot and compaction record up to current sequence
   */
  public createSnapshot(snapshotPath?: string): JournalSnapshot {
    const tasksMap = this.replayAllTasks();
    const tasks: Record<string, TaskRecord> = {};
    for (const [id, t] of tasksMap) {
      tasks[id] = t;
    }

    const snapshot: JournalSnapshot = {
      snapshotSeq: this.currentSeq,
      createdAt: new Date().toISOString(),
      rootHash: this.latestHash,
      tasks,
      metadata: {
        totalEvents: this.entries.length,
      },
    };

    if (snapshotPath) {
      const fullPath = path.resolve(snapshotPath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fullPath, JSON.stringify(snapshot, null, 2), "utf8");
    }

    this.appendSync({
      type: "SNAPSHOT_CREATED",
      payload: {
        snapshotSeq: snapshot.snapshotSeq,
        rootHash: snapshot.rootHash,
        taskCount: Object.keys(tasks).length,
      },
    });

    this.emit("snapshot:created", snapshot);
    return snapshot;
  }

  /**
   * Restore journal state from snapshot
   */
  public restoreFromSnapshot(snapshot: JournalSnapshot): void {
    if (!snapshot || typeof snapshot.snapshotSeq !== "number") {
      throw new Error("Invalid snapshot format");
    }

    this.emit("snapshot:restored", snapshot);
  }

  /**
   * Export SQLite DDL schema creation script
   */
  public exportSqliteSchema(): string {
    return `
-- CorpAI Task Event Journal SQLite Schema
CREATE TABLE IF NOT EXISTS task_events (
  seq INTEGER PRIMARY KEY,
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  task_id TEXT,
  agent_id TEXT,
  department TEXT,
  payload_json TEXT NOT NULL,
  signature TEXT,
  prev_hash TEXT NOT NULL,
  event_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_events_task_id ON task_events(task_id);
CREATE INDEX IF NOT EXISTS idx_task_events_type ON task_events(event_type);
CREATE INDEX IF NOT EXISTS idx_task_events_agent ON task_events(agent_id);
CREATE INDEX IF NOT EXISTS idx_task_events_timestamp ON task_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_task_events_hash ON task_events(event_hash);
`.trim();
  }

  /**
   * Export all events as SQLite INSERT SQL statements
   */
  public exportSqliteInsertStatements(): string[] {
    const escapeSql = (str: string | undefined | null): string => {
      if (str === undefined || str === null) return "NULL";
      return `'${str.replace(/'/g, "''")}'`;
    };

    return this.entries.map((e) => {
      const payloadJson = escapeSql(JSON.stringify(e.payload));
      return `INSERT INTO task_events (seq, event_id, event_type, timestamp, task_id, agent_id, department, payload_json, signature, prev_hash, event_hash) VALUES (${e.seq}, ${escapeSql(e.eventId)}, ${escapeSql(e.type)}, ${escapeSql(e.timestamp)}, ${escapeSql(e.taskId)}, ${escapeSql(e.agentId)}, ${escapeSql(e.department)}, ${payloadJson}, ${escapeSql(e.signature)}, ${escapeSql(e.prevHash)}, ${escapeSql(e.hash)});`;
    });
  }

  /**
   * Export all entries as JSON string
   */
  public exportJson(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  /**
   * Import entries from JSON string
   */
  public importFromJson(jsonStr: string): number {
    const entries = JSON.parse(jsonStr) as JournalEntry[];
    let count = 0;
    for (const e of entries) {
      this.appendSync({
        type: e.type,
        taskId: e.taskId,
        agentId: e.agentId,
        department: e.department,
        payload: e.payload,
        signature: e.signature,
        timestamp: e.timestamp,
      });
      count += 1;
    }
    return count;
  }

  /**
   * Reset in-memory events and truncate file if open
   */
  public clear(): void {
    this.entries.length = 0;
    this.taskIndex.clear();
    this.typeIndex.clear();
    this.currentSeq = 0;
    this.latestHash = GENESIS_PREV_HASH;

    if (this.fileDescriptor !== null && !this.options.inMemory && this.options.journalPath) {
      fs.closeSync(this.fileDescriptor);
      fs.writeFileSync(path.resolve(this.options.journalPath), "", "utf8");
      this.fileDescriptor = fs.openSync(path.resolve(this.options.journalPath), "a+");
    }
  }

  /**
   * Close open file descriptors
   */
  public close(): void {
    if (this.isClosed) return;
    this.isClosed = true;

    if (this.fileDescriptor !== null) {
      try {
        fs.closeSync(this.fileDescriptor);
      } catch {
        // Ignore
      }
      this.fileDescriptor = null;
    }
  }
}
