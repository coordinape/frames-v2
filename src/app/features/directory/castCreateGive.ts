"use client";

import { APP_PUBLIC_URL } from "~/lib/constants";
import sdk from "@farcaster/frame-sdk";

const isFrame = async () => {
  const context = await sdk.context;
  const isFrame = !!context?.user?.fid;
  return isFrame;
};

export const castCreateGive = async (
  farcasterUsername: string,
  basenameOrAddress: string,
) => {
  const inFrame = await isFrame();

  const text = `@givebot @${farcasterUsername
    .toLowerCase()
    .replace("@", "")
    .replace(" ", "")
    .split("/")
    .pop()} #create - I'm sending you #create GIVE for being a great creator.\n\n${APP_PUBLIC_URL}/creators/${basenameOrAddress}`;

  const link = `${APP_PUBLIC_URL}/creators/${basenameOrAddress}`;
  const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${link}`;
  // open this in a new tab, or use warpcast intent
  if (inFrame) {
    try {
      // @ts-ignore Property 'composeCast' does not exist on type
      await sdk.actions.composeCast({
        text,
        embeds: [link],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(
        "Problem casting - update the warpcast app and then kill/restart it",
      );
      console.error(e);
    }
  } else {
    window.open(url, "_blank");
  }
};
