/**
 * halkuRunner.ts
 *
 * Execution engine for compiled Halku/JS code.
 *
 * ALL execution happens inside a Web Worker (Blob URL).
 * There is NO main-thread fallback — running untrusted code
 * on the main thread (new Function) is forbidden.
 *
 *  Worker lifecycle:
 *   1. Blob URL created from inline worker source string
 *   2. Worker receives compiled JS via postMessage
 *   3. Worker streams console lines back as { kind:'line', type, text, timestamp }
 *   4. Worker sends { kind:'__done__' } sentinel when finished
 *   5. 5-second timeout guard terminates the worker on infinite loops
 *   6. Blob URL is always revoked; worker is always terminated
 */

import { OutputLine, OutputType, RunResult } from "./outputTypes";

// ─── ID counter (monotonically increasing, browser-session scoped) ───────────

let _idCounter = 0;
const nextId = () => ++_idCounter;

// ─── Worker source (runs in isolated thread) ─────────────────────────────────

/**
 * Inlined as a string → compiled to a Blob → run as Worker.
 *
 * • Receives { code } via postMessage
 * • Executes via new Function("console", code)  — scoped only to fakeConsole
 * • Sends lines back via { kind:'line', type, text, timestamp }
 * • Sends { kind:'__done__' } on completion (success OR caught error)
 *
 * NEVER edited to add a main-thread path.
 */
const WORKER_SOURCE = /* js */ `
"use strict";

self.onmessage = function (e) {
  var code = e.data.code;

  function serialize(arg) {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'string') return arg;
    if (arg instanceof Error) return arg.name + ': ' + arg.message;
    try { return JSON.stringify(arg, null, 2); }
    catch (_) { return String(arg); }
  }

  function makeMethod(type) {
    return function () {
      var text = Array.prototype.slice.call(arguments).map(serialize).join(' ');
      self.postMessage({ kind: 'line', type: type, text: text, timestamp: Date.now() });
    };
  }

  var sandboxConsole = {
    log:   makeMethod('log'),
    warn:  makeMethod('warn'),
    error: makeMethod('error'),
    info:  makeMethod('info'),
  };

  try {
    var fn = new Function('console', code);
    fn(sandboxConsole);
  } catch (err) {
    self.postMessage({
      kind: 'line',
      type: 'error',
      text: (err instanceof Error ? err.name + ': ' + err.message : String(err)),
      timestamp: Date.now(),
    });
  }

  self.postMessage({ kind: '__done__' });
};
`;

// ─── Timeout constant ─────────────────────────────────────────────────────────

const EXECUTION_TIMEOUT_MS = 5000;

// ─── Main runner ─────────────────────────────────────────────────────────────

/**
 * Execute compiled JS exclusively inside a Web Worker.
 *
 * @param code    Output of halkuCompile().js  (IIFE-wrapped JS string)
 * @param onLine  Streaming callback — fired for every console output line
 * @returns       Resolved RunResult once worker finishes or times out
 */
export function halkuRun(
  code: string,
  onLine: (line: OutputLine) => void
): Promise<RunResult> {
  return new Promise((resolve) => {
    // Create Blob worker
    const blob = new Blob([WORKER_SOURCE], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);
    const worker = new Worker(blobUrl);

    const accumulatedLines: OutputLine[] = [];
    let hasError = false;
    const startTs = performance.now();
    let settled = false;

    // ── Finish helper (called exactly once) ──────────────────────────────────
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      resolve({
        lines: accumulatedLines,
        hasError,
        durationMs: performance.now() - startTs,
      });
    };

    // ── Timeout — kills infinite loops ───────────────────────────────────────
    const timeoutId = setTimeout(() => {
      const line: OutputLine = {
        id: nextId(),
        type: "error",
        text: `⏱ Execution timed out after ${EXECUTION_TIMEOUT_MS / 1000}s — possible infinite loop`,
        timestamp: Date.now(),
      };
      accumulatedLines.push(line);
      onLine(line);
      hasError = true;
      finish();
    }, EXECUTION_TIMEOUT_MS);

    // ── Incoming messages from worker ────────────────────────────────────────
    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data as {
        kind: string;
        type?: OutputType;
        text?: string;
        timestamp?: number;
      };

      if (msg.kind === "__done__") {
        finish();
        return;
      }

      if (msg.kind === "line" && msg.type && msg.text !== undefined) {
        const line: OutputLine = {
          id: nextId(),
          type: msg.type,
          text: msg.text,
          timestamp: msg.timestamp ?? Date.now(),
        };
        if (line.type === "error") hasError = true;
        accumulatedLines.push(line);
        onLine(line);
      }
    };

    // ── Worker-level uncaught error ───────────────────────────────────────────
    worker.onerror = (err: ErrorEvent) => {
      const line: OutputLine = {
        id: nextId(),
        type: "error",
        text: `Worker error: ${err.message ?? "unknown"}`,
        timestamp: Date.now(),
      };
      accumulatedLines.push(line);
      onLine(line);
      hasError = true;
      finish();
    };

    // ── Send the compiled code to the worker ──────────────────────────────────
    worker.postMessage({ code });
  });
}
