/**
 * outputTypes.ts
 * Shared type definitions for the console output system.
 */

export type OutputType = "log" | "error" | "warn" | "info";

export interface OutputLine {
  /** Discriminated type for colour-coding */
  type: OutputType;
  /** The rendered text (already serialised from raw args) */
  text: string;
  /** Unix ms timestamp */
  timestamp: number;
  /** Incrementing id to key React items without index */
  id: number;
}

/** Result returned by the runner */
export interface RunResult {
  lines: OutputLine[];
  hasError: boolean;
  durationMs: number;
}
