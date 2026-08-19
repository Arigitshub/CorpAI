/**
 * Task Dispatching and Paired Critic Validation Types
 */

export type TaskPriority = "P1" | "P2" | "P3" | "P4" | "P5";

export const TaskPriorityWeight: Record<TaskPriority, number> = {
  P1: 1,
  P2: 2,
  P3: 3,
  P4: 4,
  P5: 5,
};

export type TaskStatus =
  | "queued"
  | "assigned"
  | "running"
  | "awaiting_critic"
  | "critic_reviewing"
  | "changes_requested"
  | "approved"
  | "completed"
  | "failed"
  | "cancelled";

export interface CriticReview {
  criticId: string;
  taskId: string;
  workerId: string;
  status: "approved" | "rejected" | "changes_requested";
  score: number; // 0.0 - 1.0
  feedback: string;
  timestamp: string;
  payloadHash: string;
  signature: string;
}

export interface TaskDispatchParams {
  title: string;
  description?: string;
  priority?: TaskPriority;
  department?: string;
  requiredCapabilities?: string[];
  payload?: unknown;
  assignedWorkerId?: string;
  assignedCriticId?: string;
  maxRetries?: number;
}

export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  department: string;
  requiredCapabilities: string[];
  status: TaskStatus;
  assignedWorkerId?: string;
  assignedCriticId?: string;
  payload: unknown;
  result?: unknown;
  resultHash?: string;
  review?: CriticReview;
  reviewHistory: CriticReview[];
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  error?: string;
}

export interface TaskFilter {
  status?: TaskStatus | TaskStatus[];
  department?: string;
  assignedWorkerId?: string;
  assignedCriticId?: string;
  priority?: TaskPriority;
}

export interface CriticValidationResult {
  valid: boolean;
  score: number;
  approved: boolean;
  criticId: string;
  signatureValid: boolean;
  reasons: string[];
}
