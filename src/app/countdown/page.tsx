import { Metadata } from "next";
import CountdownApp from "./countdown-app";

// const appUrl = process.env.NEXT_PUBLIC_URL;
// const appUrl = process.env.VERCEL_URL;
const appUrl = `https://${process.env.VERCEL_URL}`;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "Launch Frame",
    action: {
      type: "launch_frame",
      name: "Countdown Frame",
      url: `${appUrl}/countdown`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Farcaster Frames v2 Demo",
    openGraph: {
      title: "Farcaster Frames v2 Demo",
      description: "A Farcaster Frames v2 demo app.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function CountdownPage() {
  return <CountdownApp />;
}
