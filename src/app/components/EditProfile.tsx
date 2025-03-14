"use client";

import { useWalletConnection } from "~/components/FrameOrWalletConnection";
import Link from "next/link";

export const EditProfile = ({
  address,
  basename,
}: {
  address: string;
  basename?: string;
}) => {
  const { address: myAddress } = useWalletConnection();

  if (myAddress === address) {
    return (
      <Link
        href={`/creators/${basename || address}/edit`}
        className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 transition-all inline-flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
