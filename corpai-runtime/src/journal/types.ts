import { CriticReview, TaskPriority, TaskRecord, TaskStatus } from "../dispatch/types";

export type JournalEventType =
  | "TASK_DISPATCHED"
  | "TASK_ASSIGNED"
  | "TASK_RUNNING"
  | "TASK_RESULT_SUBMITTED"
  | "CRITIC_REVIEWED"
  | "TASK_COMPLETED"
  | "TASK_FAILED"
  | "TASK_CANCELLED"
  | "TASK_RETRIED"
  | "TOKEN_BUDGET_ALLOCATED"
  | "EMERGENCY_BURST_GRANTED"
  | "CLUSTER_NODE_JOINED"
  | "CLUSTER_NODE_LEFT"
  | "SNAPSHOT_CREATED"
  | "CUSTOM_EVENT";

export interface JournalEntry<T = unknown> {
  seq: number; // 1-indexed monotonic sequence
  eventId: string; // Unique UUID
  type: JournalEventType;
  timestamp: string; // ISO 8601
  taskId?: string;
  agentId?: string;
  department?: string;
  payload: T;
  signature?: string; // Cryptographic HMAC / Critic signature
  prevHash: string; // SHA-256 hash of previous entry
  hash: string; // SHA-256 hash of this entry
}

export interface JournalFilter {
  taskId?: string | string[];
  type?: JournalEventType | JournalEventType[];
  agentId?: string;
  department?: string;
  fromSeq?: number;
  toSeq?: number;
  fromTimestamp?: string;
  toTimestamp?: string;
  limit?: number;
  offset?: number;
}

export interface CorruptedEntryReport {
  seq: number;
  eventId: string;
  expectedHash: string;
  actualHash: string;
  reason: string;
}

export interface SignatureFailureReport {
  seq: number;
  taskId?: string;
  agentId?: string;
  criticId?: string;
  reason: string;
}

export interface JournalIntegrityReport {
  valid: boolean;
  totalEvents: number;
  firstSeq: number;
  lastSeq: number;
  rootHash: string;
  corruptedEntries: CorruptedEntryReport[];
  signatureFailures: SignatureFailureReport[];
  verifiedAt: string;
}

export interface JournalSnapshot {
  snapshotSeq: number;
  createdAt: string;
  rootHash: string;
  tasks: Record<string, TaskRecord>;
  metadata?: Record<string, unknown>;
}

export interface TaskJournalOptions {
  journalPath?: string;
  sqlitePath?: string;
  inMemory?: boolean;
  autoFlush?: boolean;
  verifyOnLoad?: boolean;
}
