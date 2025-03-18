"use server";

import { bustAllOpenSeaCaches } from "~/lib/getNFTContracts";
import { kv } from "@vercel/kv";

const REFRESH_COOLDOWN = 60; // 1 minute cooldown in seconds

export async function refreshRequirementsCache(address: string) {
  try {
    const lockKey = `refresh-lock-${address}`;
    const isLocked = await kv.exists(lockKey);

    if (isLocked) {
      const ttl = await kv.ttl(lockKey);
      return {
        success: false,
        error: `Please wait ${ttl} seconds before refreshing again`,
      };
    }

    // Set the lock with expiration
    await kv.set(lockKey, true, { ex: REFRESH_COOLDOWN });

    // Bust all OpenSea related caches for this address
    await bustAllOpenSeaCaches(address);
    return { success: true };
  } catch (error) {
    console.error("Failed to refresh cache:", error);
    return { success: false, error: "Failed to refresh cache" };
  }
}
