"use client";

import { castCreateGive } from "~/app/features/directory/castCreateGive";

export const GiveButton = ({
  farcasterUsername,
  baseName,
}: {
  farcasterUsername: string;
  baseName: string;
}) => (
  <span
    className="px-3 py-2 text-sm bg-white text-base-blue rounded-full cursor-pointer hover:bg-white/90 transition-colors items-center mt-[-16px] text-center"
    onClick={() => castCreateGive(farcasterUsername, baseName)}
  >
    Send <span className="font-bold">#create</span> GIVE
  </span>
);
