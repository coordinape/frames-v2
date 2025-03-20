"use client";

import { useState } from "react";

export default function ShareButton({ text = "Share" }: { text?: string }) {
  const [showCopied, setShowCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {showCopied && (
        <span className="text-xs text-white/80 animate-fade-in-out italic">
          Copied
        </span>
      )}
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-4 py-1 text-xs bg-white/10 text-white text-xs rounded-full cursor-pointer hover:bg-white/20 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        {text}
      </button>
    </div>
  );
}
