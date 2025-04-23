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
  const appUrl = `https://${APP_BASE_URL}`;
  return {
    title: "Join Creator Directory",
    description: "Join the Creator Directory and connect with the community",
    openGraph: {
      title: "Join Creator Directory",
      description: "Join the Creator Directory and connect with the community",
      images: [
        {
          url: `${appUrl}/ogimage?title=Join+Directory`,
          width: 1200,
          height: 630,
          alt: "Join Creator Directory",
        },
      ],
      url: `${appUrl}/creators/join`,
      type: "website",
      siteName: "Creator Directory",
    },
    twitter: {
      card: "summary_large_image",
      title: "Join Creator Directory",
      description: "Join the Creator Directory and connect with the community",
      images: [`${appUrl}/ogimage?title=Join+Directory`],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}
