"use client";

import { useRouter } from "next/navigation";

interface SkillTagProps {
  skill: string;
  type: "give" | "medium";
  count?: number;
  warpcastUrl?: string;
  className?: string;
}

export default function SkillTag({
  skill,
  type,
  count,
  warpcastUrl,
  className = "",
}: SkillTagProps) {
  const router = useRouter();

  const handleClick = () => {
    const params = new URLSearchParams();
    params.set("search", skill);
    params.set("type", type);
    router.push(`/creators?${params.toString()}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center bg-white/10 hover:bg-white/15 rounded-full px-3 py-1 text-sm cursor-pointer ${className}`}
    >
      <span className="text-white/90 hover:text-white">{skill}</span>
      {count !== undefined && (
        <span className="ml-2 text-white/60 text-xs">{count}</span>
      )}
      {warpcastUrl && (
        <a
          href={warpcastUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-blue-300 hover:text-blue-200"
          onClick={(e) => e.stopPropagation()}
        >
          ↗
        </a>
      )}
    </div>
  );
}
