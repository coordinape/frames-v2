"use client";

import { ReactNode } from "react";
import sdk from "@farcaster/frame-sdk";

const isFrame = async () => {
  const context = await sdk.context;
  const isFrame = !!context?.user?.fid;
  return isFrame;
};

interface ExternalLinkButtonProps {
  url: string;
  children: ReactNode;
  className?: string;
}

export default function ExternalLinkButton({
  url,
  children,
  className = "",
}: ExternalLinkButtonProps) {
  const handleClick = async () => {
    const inFrame = await isFrame();
    if (inFrame) {
      try {
        await sdk.actions.openUrl(url);
      } catch (e) {
        console.error(e);
        window.open(url, "_blank");
      }
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
