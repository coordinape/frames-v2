"use client";

import { useWalletConnection } from "~/components/FrameOrWalletConnection";
import Link from "next/link";
import { useEffect, useState } from "react";

export const EditProfile = ({
  address,
  basename,
}: {
  address: string;
  basename?: string;
}) => {
  const { address: myAddress } = useWalletConnection();

  const [owner, setOwner] = useState<boolean>(false);
  useEffect(() => {
    setOwner(myAddress === address);
  }, [address, myAddress]);

  if (owner) {
    return (
      <Link
        href={`/creators/${basename || address}/edit`}
        className="px-4 py-1 bg-white/10 text-white text-xs rounded-full cursor-pointer hover:bg-white/20 transition-colors inline-flex items-center"
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
          className="mr-2"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Edit Profile
      </Link>
    );
  }
  return null;
};
