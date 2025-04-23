import { Metadata } from "next";
import CreatorsList from "./CreatorsList";
import { APP_BASE_URL } from "~/lib/constants";

export default function DirectoryPage() {
  return <CreatorsList />;
}

// const appUrl = process.env.NEXT_PUBLIC_URL;
// const appUrl = process.env.VERCEL_URL;
// const appUrl = APP_BASE_URL;

const frame = {
  version: "next",
  imageUrl: `${APP_BASE_URL}/creators/ogimage`,
  button: {
    title: "Launch Frame",
    action: {
      type: "launch_frame",
      name: "Creator Directory",
      url: `${APP_BASE_URL}/creators`,
      splashImageUrl: `${APP_BASE_URL}/splash.png`,
      splashBackgroundColor: "#0053ff",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Creator Directory ${APP_BASE_URL}/creators/ogimage`,
    openGraph: {
      title: "Creator Directory",
      description: `The Creator Directory`,
      images: `${APP_BASE_URL}/creators/ogimage?aspect_ratio=twitter`,
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}
