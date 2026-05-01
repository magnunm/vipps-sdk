import type { VippsProblem } from "./types.ts";

export class VippsApiError extends Error {
  readonly status: number;
  readonly traceId: string;
  readonly problem: VippsProblem;

  constructor(problem: VippsProblem) {
    super(`${problem.status} ${problem.title}${problem.detail ? `: ${problem.detail}` : ""}`);
    this.name = "VippsApiError";
    this.status = problem.status;
    this.traceId = problem.traceId;
    this.problem = problem;
  }
}
