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
    .replace("@", "")
    .replace(" ", "")
    .split("/")
    .pop()} #create - I'm sending you #create GIVE for being a great creator. ${APP_PUBLIC_URL}/creators/${basenameOrAddress}}`;

  const link = `${APP_PUBLIC_URL}/creators/${basenameOrAddress}`;
  const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${link}`;
  // open this in a new tab, or use warpcast intent
  if (inFrame) {
    alert("trying to compose");
    try {
      const res = await sdk.actions.composeCast({
        text,
        embeds: [link],
      });
      alert("success:" + JSON.stringify(res));
    } catch (e: unknown) {
      alert("Error composing cast: " + e.message);
    }
  } else {
    alert("non frame open the window");
    window.open(url, "_blank");
  }
};
