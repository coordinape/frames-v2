import { Metadata } from "next";
import { redirect } from "next/navigation";
import { APP_BASE_URL } from "~/lib/constants";

const frame = {
  version: "next",
  imageUrl: `${APP_BASE_URL}/ogimage?title=Creators`,
  button: {
    title: "Launch Frame",
    action: {
      type: "launch_frame",
      name: "Coordinape Frames v2 Demo",
      url: APP_BASE_URL,
      splashImageUrl: `${APP_BASE_URL}/splash.png`,
      splashBackgroundColor: "#0053ff",
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
  redirect("/creators");
}
