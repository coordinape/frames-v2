import { Metadata } from "next";
import JoinClient from "./JoinClient";

export default function JoinPage() {
  return <JoinClient />;
}

// Use a consistent approach for appUrl across all pages
const appUrl = `https://${
  process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL
}`;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/ogimage?title=Join+Directory`,
  button: {
    title: "Launch Frame",
    action: {
      type: "launch_frame",
      name: "Join Frame",
      url: `${appUrl}/creators/join`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Join Creator Directory",
    openGraph: {
      title: "Join Creator Directory",
      description: "Join the creator directory.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}
