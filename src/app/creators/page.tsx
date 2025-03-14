import { Metadata } from "next";
import CreatorsList from "./CreatorsList";

export default function DirectoryPage() {
  return <CreatorsList />;
}

// Use a consistent approach for appUrl across all pages
const appUrl = `https://${
  process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL
}`;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/creators/ogimage`,
  button: {
    title: "Launch Frame",
    action: {
      type: "launch_frame",
      name: "Creator Directory",
      url: `${appUrl}/creators`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Creator Directory",
    openGraph: {
      title: "Creator Directory",
      description: "The creator directory.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}
