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
      name: "Based Creators Directory",
      url: APP_BASE_URL,
      splashImageUrl: `${APP_BASE_URL}/splash.png`,
      splashBackgroundColor: "#0053ff",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Based Creators Directory",
    openGraph: {
      title: "Based Creators Directory",
      description: "Based Creators Directory.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  redirect("/creators");
}
