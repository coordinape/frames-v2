import { Metadata } from "next";
import App from "./app";

// Use a consistent approach for appUrl across all pages
const appUrl = `https://${
  process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL
}`;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/ogimage?title=Creators`,
  button: {
    title: "Launch Frame",
    action: {
      type: "launch_frame",
      name: "Coordinape Frames v2 Demo",
      url: `${appUrl}`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Coordinape Frames v2 Demo",
    openGraph: {
      title: "Coordinape Frames v2 Demo",
      description: "A Coordinape Frames v2 demo app.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <App />;
}
