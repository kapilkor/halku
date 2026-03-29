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
  console.log('halkuRun: starting execution for code:', code);
  return new Promise((resolve) => {
    const runId = nextId();
    const startTime = Date.now();
    const lines: OutputLine[] = [];
    let hasError = false;

    let worker: Worker | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function cleanup() {
      console.log('halkuRun: cleanup for runId', runId);
      if (timeoutId) clearTimeout(timeoutId);
      if (worker) {
        worker.terminate();
        worker = null;
      }
    }

    try {
      const blob = new Blob([WORKER_SOURCE], { type: "application/javascript" });
      const blobUrl = URL.createObjectURL(blob);
      worker = new Worker(blobUrl);
      URL.revokeObjectURL(blobUrl); // Revoke immediately

      worker.onmessage = (e) => {
        console.log('halkuRun: message from worker', e.data);
        if (e.data.kind === "__done__") {
          cleanup();
          resolve({
            id: runId,
            ok: !hasError,
            elapsed: Date.now() - startTime,
            lines,
            hasError,
            durationMs: Date.now() - startTime,
          });
          return;
        }

        if (e.data.kind === "line") {
          const line: OutputLine = e.data;
          if (line.type === "error") hasError = true;
          lines.push(line);
          onLine(line);
        }
      };

      worker.onerror = (e) => {
        console.error('halkuRun: worker error', e);
        cleanup();
        const errorLine: OutputLine = {
          type: "error",
          text: `Halku runtime error: ${e.message}`,
          timestamp: Date.now(),
          id: nextId(),
        };
        lines.push(errorLine);
        onLine(errorLine);
        resolve({
          id: runId,
          ok: false,
          elapsed: Date.now() - startTime,
          lines,
          hasError: true,
          durationMs: Date.now() - startTime,
        });
      };

      // Timeout guard
      timeoutId = setTimeout(() => {
        console.warn('halkuRun: execution timed out for runId', runId);
        cleanup();
        const timeoutLine: OutputLine = {
          type: "error",
          text: `Execution timed out after ${EXECUTION_TIMEOUT_MS / 1000}s`,
          timestamp: Date.now(),
          id: nextId(),
        };
        lines.push(timeoutLine);
        onLine(timeoutLine);
        resolve({
          id: runId,
          ok: false,
          elapsed: Date.now() - startTime,
          lines,
          hasError: true,
          durationMs: Date.now() - startTime,
        });
      }, EXECUTION_TIMEOUT_MS);

      console.log('halkuRun: posting code to worker for runId', runId);
      worker.postMessage({ code });
    } catch (err) {
      console.error('halkuRun: error setting up worker', err);
      cleanup();
      const setupErrorLine: OutputLine = {
        type: "error",
        text:
          "Halku runner failed to initialize. This may be a browser compatibility issue.",
        timestamp: Date.now(),
        id: nextId(),
      };
      lines.push(setupErrorLine);
      onLine(setupErrorLine);
      resolve({
        id: runId,
        ok: false,
        elapsed: Date.now() - startTime,
        lines,
        hasError: true,
        durationMs: Date.now() - startTime,
      });
    }
  });
}
