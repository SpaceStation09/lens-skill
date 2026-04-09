import type { LensPage, LensResult } from "@/lib/lens/contracts";

function baseMeta(cursor?: string | null, nextCursor?: string | null): LensResult<never>["meta"] {
  return {
    cursor: cursor ?? null,
    nextCursor: nextCursor ?? null,
    hasMore: nextCursor ? true : false,
    source: "lens",
    timestamp: new Date().toISOString(),
  };
}

export function okResult<T>(data: T, cursor?: string | null, nextCursor?: string | null): LensResult<T> {
  return {
    success: true,
    data,
    error: null,
    meta: baseMeta(cursor, nextCursor),
  };
}

export function errResult<T>(code: string, message: string, retryable = false, details?: unknown): LensResult<T> {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
      retryable,
      details,
    },
    meta: baseMeta(),
  };
}

export function emptyPage<T>(): LensPage<T> {
  return {
    items: [],
    pageInfo: {
      prev: null,
      next: null,
    },
  };
}
