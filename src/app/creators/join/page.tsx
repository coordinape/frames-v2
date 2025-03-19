import { Metadata } from "next";
import JoinClient from "./JoinClient";

export default function JoinPage() {
  return <JoinClient />;
}

// const appUrl = process.env.NEXT_PUBLIC_URL;
// const appUrl = process.env.VERCEL_URL;
const appUrl = `https://${process.env.VERCEL_URL}`;

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
      splashBackgroundColor: "#0053ff",
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
