import { kv } from "@vercel/kv";
import { Address } from "viem";
import { BasenameTextRecordKeys } from "~/app/creators/[username]/basenames";

// Cache duration: 24 hours
const BASENAME_CACHE_DURATION = 86400;

// Cache keys prefixes
const ADDRESS_TO_BASENAME_PREFIX = "basename:addr:";
const BASENAME_TO_ADDRESS_PREFIX = "basename:name:";
const BASENAME_TEXT_RECORDS_PREFIX = "basename:records:";

export interface CachedBasenameResolution {
  basename: string;
  address: Address;
  textRecords: Record<BasenameTextRecordKeys, string | undefined>;
}

/**
 * Get cached basename resolution for an address
 */
export async function getCachedBasenameResolution(
  input: string,
): Promise<CachedBasenameResolution | null> {
  const cacheKey = input.toLowerCase().endsWith(".base.eth")
    ? `${BASENAME_TO_ADDRESS_PREFIX}${input.toLowerCase()}`
    : `${ADDRESS_TO_BASENAME_PREFIX}${input.toLowerCase()}`;

  const cached = await kv.get<CachedBasenameResolution>(cacheKey);
  return cached;
}

/**
 * Cache basename resolution data
 */
export async function cacheBasenameResolution(
  resolution: CachedBasenameResolution,
): Promise<void> {
  const addressKey = `${ADDRESS_TO_BASENAME_PREFIX}${resolution.address.toLowerCase()}`;
  const basenameKey = `${BASENAME_TO_ADDRESS_PREFIX}${resolution.basename.toLowerCase()}`;
  const recordsKey = `${BASENAME_TEXT_RECORDS_PREFIX}${resolution.basename.toLowerCase()}`;

  // Use multi to set all cache entries atomically
  const multi = kv.multi();
  multi.set(addressKey, resolution, { ex: BASENAME_CACHE_DURATION });
  multi.set(basenameKey, resolution, { ex: BASENAME_CACHE_DURATION });
  multi.set(recordsKey, resolution.textRecords, {
    ex: BASENAME_CACHE_DURATION,
  });
  await multi.exec();
}

/**
 * Bust the cache for a basename or address
 */
export async function bustBasenameCache(input: string): Promise<void> {
  const normalizedInput = input.toLowerCase();
  const isBasename = normalizedInput.endsWith(".base.eth");

  // Get the cached resolution first to be able to bust both sides of the mapping
  const cached = await getCachedBasenameResolution(normalizedInput);
  if (!cached) return;

  const multi = kv.multi();
  multi.del(`${ADDRESS_TO_BASENAME_PREFIX}${cached.address.toLowerCase()}`);
  multi.del(`${BASENAME_TO_ADDRESS_PREFIX}${cached.basename.toLowerCase()}`);
  multi.del(`${BASENAME_TEXT_RECORDS_PREFIX}${cached.basename.toLowerCase()}`);
  await multi.exec();
}
