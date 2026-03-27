/**
 * shareCode.ts — LZ-string encode/decode + URL sharing
 *
 * URL length warning: if encoded URL > 800 chars, caller is notified.
 */

import LZString from "lz-string";

const PARAM_KEY   = "c";
const URL_WARN_LEN = 800; // chars — warn above this

// ─── Encode ───────────────────────────────────────────────────────────────────

export interface EncodeResult {
  url:         string;
  compressed:  string;
  warned:      boolean;  // true if url > URL_WARN_LEN chars
}

export function encodeShareUrl(code: string): EncodeResult {
  const compressed = LZString.compressToEncodedURIComponent(code);
  const base =
    typeof window !== "undefined"
      ? `${window.location.origin}/playground`
      : "/playground";
  const url = `${base}?${PARAM_KEY}=${compressed}`;
  return {
    url,
    compressed,
    warned: url.length > URL_WARN_LEN,
  };
}

export function encodeCode(code: string): string {
  return LZString.compressToEncodedURIComponent(code);
}

// ─── Decode ───────────────────────────────────────────────────────────────────

export function decodeCode(compressed: string): string | null {
  if (!compressed) return null;
  try {
    const result = LZString.decompressFromEncodedURIComponent(compressed);
    return result?.length ? result : null;
  } catch {
    return null;
  }
}

export function readShareFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params     = new URLSearchParams(window.location.search);
  const compressed = params.get(PARAM_KEY);
  if (!compressed) return null;
  return decodeCode(compressed);
}

export function clearShareParam(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete(PARAM_KEY);
  window.history.replaceState({}, "", url.toString());
}
