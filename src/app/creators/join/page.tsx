import { Metadata } from "next";
import JoinClient from "./JoinClient";
import { APP_BASE_URL } from "~/lib/constants";

export default function JoinPage() {
  return <JoinClient />;
}

const frame = {
  version: "next",
  imageUrl: `${APP_BASE_URL}/ogimage?title=Join+Directory`,
  button: {
    title: "Launch Frame",
    action: {
      type: "launch_frame",
      name: "Join Frame",
      url: `${APP_BASE_URL}/creators/join`,
      splashImageUrl: `${APP_BASE_URL}/splash.png`,
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
      images: `${APP_BASE_URL}/ogimage?title=Join+Directory&aspect_ratio=twitter`,
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}
