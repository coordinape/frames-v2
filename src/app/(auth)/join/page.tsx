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
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "Launch Frame",
    action: {
      type: "launch_frame",
      name: "Join Frame",
      url: `${appUrl}/join`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Join Frame",
    openGraph: {
      title: "Join Frame",
      description: "Join the creatordirectory.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}
