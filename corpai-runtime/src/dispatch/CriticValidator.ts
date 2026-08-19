import * as crypto from "crypto";
import { CriticReview, CriticValidationResult, TaskRecord } from "./types";
import { JsonRpcException } from "../protocol/errors";

export class CriticValidator {
  /**
   * Produce a deterministic SHA-256 hash of any payload or result object.
   */
  public static hashPayload(payload: unknown): string {
    const canonicalString = this.canonicalStringify(payload);
    return crypto.createHash("sha256").update(canonicalString).digest("hex");
  }

  /**
   * Deterministic JSON stringify with sorted keys
   */
  public static canonicalStringify(obj: unknown): string {
    if (obj === null || typeof obj !== "object") {
      return JSON.stringify(obj) ?? "null";
    }

    if (Array.isArray(obj)) {
      return `[${obj.map((item) => this.canonicalStringify(item)).join(",")}]`;
    }

    const keys = Object.keys(obj as Record<string, unknown>).sort();
    const entries = keys.map(
      (k) => `${JSON.stringify(k)}:${this.canonicalStringify((obj as Record<string, unknown>)[k])}`
    );
    return `{${entries.join(",")}}`;
  }

  /**
   * Compute the canonical message that the critic signs.
   */
  public static getSignableMessage(reviewData: {
    criticId: string;
    taskId: string;
    workerId: string;
    status: string;
    score: number;
    payloadHash: string;
    timestamp: string;
  }): string {
    return [
      reviewData.criticId,
      reviewData.taskId,
      reviewData.workerId,
      reviewData.status,
      reviewData.score.toFixed(4),
      reviewData.payloadHash,
      reviewData.timestamp,
    ].join("|");
  }

  /**
   * Generate an HMAC-SHA256 signature for a critic review using the critic's secret key.
   */
  public static signReview(
    secretKey: string,
    reviewData: {
      criticId: string;
      taskId: string;
      workerId: string;
      status: "approved" | "rejected" | "changes_requested";
      score: number;
      feedback: string;
      timestamp: string;
      payloadHash: string;
    }
  ): CriticReview {
    const signable = this.getSignableMessage(reviewData);
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(signable)
      .digest("hex");

    return {
      ...reviewData,
      signature,
    };
  }

  /**
   * Verify HMAC-SHA256 signature of a critic review.
   */
  public static verifySignature(review: CriticReview, secretKey: string): boolean {
    if (!review.signature || !secretKey) {
      return false;
    }

    const signable = this.getSignableMessage(review);
    const expected = crypto
      .createHmac("sha256", secretKey)
      .update(signable)
      .digest("hex");

    try {
      const sigBuf = Buffer.from(review.signature, "hex");
      const expBuf = Buffer.from(expected, "hex");
      if (sigBuf.length !== expBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(sigBuf, expBuf);
    } catch {
      return false;
    }
  }

  /**
   * Validate a full review against task state, critic identity, payload hash, signature, and approval criteria.
   */
  public static validateReview(
    task: TaskRecord,
    review: CriticReview,
    criticSecretKey?: string,
    minApprovalScore = 0.70
  ): CriticValidationResult {
    const reasons: string[] = [];
    let signatureValid = false;

    // 1. Critic assignment check
    if (task.assignedCriticId && task.assignedCriticId !== review.criticId) {
      reasons.push(
        `Critic '${review.criticId}' does not match assigned critic '${task.assignedCriticId}'`
      );
    }

    // 2. Worker assignment check
    if (task.assignedWorkerId && task.assignedWorkerId !== review.workerId) {
      reasons.push(
        `Review workerId '${review.workerId}' does not match assigned worker '${task.assignedWorkerId}'`
      );
    }

    // 3. Payload hash integrity
    if (task.resultHash && task.resultHash !== review.payloadHash) {
      reasons.push(
        `Payload hash mismatch: expected '${task.resultHash}', got '${review.payloadHash}'`
      );
    }

    // 4. Cryptographic signature check
    if (criticSecretKey) {
      signatureValid = this.verifySignature(review, criticSecretKey);
      if (!signatureValid) {
        reasons.push("Cryptographic HMAC signature verification failed");
      }
    } else {
      // If no secret key is available in registry, signature cannot be verified
      signatureValid = false;
      reasons.push("No secret key found for critic to verify signature");
    }

    // 5. Score threshold check
    if (review.score < minApprovalScore) {
      reasons.push(
        `Critic score ${review.score.toFixed(2)} is below minimum threshold ${minApprovalScore.toFixed(2)}`
      );
    }

    // 6. Review status
    if (review.status !== "approved") {
      reasons.push(`Review status is '${review.status}' (feedback: ${review.feedback})`);
    }

    const approved =
      review.status === "approved" &&
      review.score >= minApprovalScore &&
      signatureValid &&
      reasons.length === 0;

    return {
      valid: reasons.length === 0,
      score: review.score,
      approved,
      criticId: review.criticId,
      signatureValid,
      reasons,
    };
  }
}
