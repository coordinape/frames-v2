import { Metadata } from "next";
import App from "./app";

// const appUrl = process.env.NEXT_PUBLIC_URL;
const appUrl = process.env.VERCEL_URL;

const frame = {
  version: "next",
  imageUrl: `https://${appUrl}/opengraph-image`,
  button: {
    title: "Launch Frame",
    action: {
      type: "launch_frame",
      name: "Coordinape Frames v2 Demo",
      url: `https://${appUrl}`,
      splashImageUrl: `https://${appUrl}/splash.png`,
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
