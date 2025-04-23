import { Metadata } from "next";
import CreatorsList from "./CreatorsList";
import { APP_BASE_URL } from "~/lib/constants";

export default function DirectoryPage() {
  return <CreatorsList />;
}

// const appUrl = process.env.NEXT_PUBLIC_URL;
// const appUrl = process.env.VERCEL_URL;
// const appUrl = APP_BASE_URL;
const appUrl = `https://${APP_BASE_URL}`;

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
    title: "Base Creator Directory",
    description: "Discover and connect with creators",
    openGraph: {
      title: "Base Creator Directory",
      description: "Discover and connect with creators",
      images: [
        {
          url: `${appUrl}/creators/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Base Creator Directory",
        },
      ],
      url: `${appUrl}/creators`,
      type: "website",
      siteName: "Base Creator Directory",
    },
    twitter: {
      card: "summary_large_image",
      title: "Base Creator Directory",
      description: "Discover and connect with creators",
      images: [`${appUrl}/creators/opengraph-image`],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}
