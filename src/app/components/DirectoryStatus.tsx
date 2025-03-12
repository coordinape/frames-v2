import React from "react";

interface DirectoryStatusProps {
  hasJoined: boolean;
}

export default function DirectoryStatus({ hasJoined }: DirectoryStatusProps) {
  return (
    <div className="text-white text-sm">
      {hasJoined ? (
        <span className="text-green-400">✓ Joined</span>
      ) : (
        <button onClick={() => (window.location.href = "/join")} className="px-4 py-2 bg-[#0052CC] rounded-lg hover:bg-[#0047B3] transition-colors">
          Join Directory
        </button>
      )}
    </div>
  );
}
