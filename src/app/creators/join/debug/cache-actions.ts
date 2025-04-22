// Server-side actions for cache management
"use server";

import { kv } from "@vercel/kv";
import {
  CREATORS_CACHE_KEY,
  REVALIDATION_LOCK_KEY,
} from "~/app/features/directory/constants";

export interface CacheDebugInfo {
  cacheExists: boolean;
  ttl: number;
  creatorCount: number | null;
  lockExists: boolean;
  lockTTL: number;
  lastRevalidationTime: number | null;
}

/**
 * Get cache information for the creators directory
 */
export async function getCacheInfo(): Promise<CacheDebugInfo> {
  const multi = kv.multi();
  multi.exists(CREATORS_CACHE_KEY);
  multi.ttl(CREATORS_CACHE_KEY);
  multi.get(CREATORS_CACHE_KEY);
  multi.exists(REVALIDATION_LOCK_KEY);
  multi.ttl(REVALIDATION_LOCK_KEY);
  multi.get(REVALIDATION_LOCK_KEY);

  const [
    cacheExists,
    ttl,
    cacheData,
    lockExists,
    lockTTL,
    lastRevalidationTime,
  ] = await multi.exec();

  return {
    cacheExists: !!cacheExists,
    ttl: ttl as number,
    creatorCount: cacheData ? (cacheData as any).data?.length : null,
    lockExists: !!lockExists,
    lockTTL: lockTTL as number,
    lastRevalidationTime: lastRevalidationTime as number | null,
  };
}
