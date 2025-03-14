"use client";

import React from "react";

interface DirectoryStatusProps {
  hasJoined: boolean;
}

export default function DirectoryStatus({ hasJoined }: DirectoryStatusProps) {
  return (
    <div>
      {hasJoined ? (
        <span className="text-green-400 text-sm">✓ Joined</span>
      ) : (
        <button
          onClick={() => (window.location.href = "/creators/join")}
          className="px-4 py-1 bg-white text-base-blue text-xs rounded-full"
        >
          Join the Directory
        </button>
      )}
    </div>
  );
}
