"use client";

import { useEffect, useState } from "react";
import { getCacheInfo, forceRevalidate } from "./cache-actions";
import {
  CACHE_DURATION,
  LOCK_DURATION,
  REVALIDATION_WINDOW,
} from "~/app/features/directory/constants";
import type { CacheDebugInfo } from "./cache-actions";

// Client Component
export default function CreatorsListInfo() {
  const [info, setInfo] = useState<CacheDebugInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [revalidationTime, setRevalidationTime] = useState<Date | null>(null);

  const refreshInfo = async () => {
    try {
      const newInfo = await getCacheInfo();
      setInfo(newInfo);
      // Calculate fixed times based on when we received the info
      const receivedTime = Date.now();
      setExpiryTime(new Date(receivedTime + newInfo.ttl * 1000));
      setRevalidationTime(
        new Date(receivedTime + (newInfo.ttl - REVALIDATION_WINDOW) * 1000),
      );
    } catch (error) {
      console.error("Failed to fetch cache info:", error);
    }
  };

  useEffect(() => {
    refreshInfo();

    // Keep only the time interval for live TTL updates
    const timeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  const handleRevalidate = async () => {
    setIsRefreshing(true);
    try {
      await forceRevalidate();
      await refreshInfo();
    } catch (error) {
      console.error("Failed to revalidate:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!info || !expiryTime || !revalidationTime) {
    return <div className="text-white text-sm">Loading cache info...</div>;
  }

  // Calculate times

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return "Expired";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${info.cacheExists ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className="text-sm font-medium">Cache Status</span>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm bg-white/5 p-4 rounded-lg">
          <div className="text-white/70">Cache Exists:</div>
          <div>{info.cacheExists ? "Yes" : "No"}</div>

          {info.cacheExists && (
            <>
              <div className="text-white/70">Creators Count:</div>
              <div>{info.creatorCount}</div>

              <div className="text-white/70">TTL:</div>
              <div>{formatTimeRemaining(info.ttl)}</div>

              <div className="text-white/70">Expires At:</div>
              <div>{expiryTime.toLocaleTimeString()}</div>

              <div className="text-white/70">Revalidation At:</div>
              <div>{revalidationTime.toLocaleTimeString()}</div>
            </>
          )}

          <div className="text-white/70">Lock Status:</div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${info.lockExists ? "bg-yellow-500" : "bg-gray-500"}`}
            />
            {info.lockExists
              ? `Locked (${formatTimeRemaining(info.lockTTL)})`
              : "Unlocked"}
          </div>

          {info.lastRevalidationTime && (
            <>
              <div className="text-white/70">Last Revalidation:</div>
              <div>
                {new Date(info.lastRevalidationTime).toLocaleTimeString()}
              </div>
            </>
          )}

          <div className="text-white/70">Cache Duration:</div>
          <div>{CACHE_DURATION / 60} minutes</div>

          <div className="text-white/70">Lock Duration:</div>
          <div>{LOCK_DURATION} seconds</div>

          <div className="text-white/70">Revalidation Window:</div>
          <div>{REVALIDATION_WINDOW} seconds</div>
        </div>
      </div>

      <button
        onClick={handleRevalidate}
        disabled={isRefreshing}
        className="px-4 py-2 bg-white/10 text-white rounded-full text-sm hover:bg-white/20 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRefreshing ? "Revalidating..." : "Force Revalidation"}
      </button>
    </div>
  );
}
