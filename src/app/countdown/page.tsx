import { Metadata } from "next";
import CountdownApp from "./countdown-app";
import { APP_BASE_URL } from "~/lib/constants";

const frame = {
  version: "next",
  imageUrl: `${APP_BASE_URL}/ogimage?title=Countdown`,
  button: {
    title: "Launch Frame",
    action: {
      type: "launch_frame",
      name: "Countdown Frame",
      url: `${APP_BASE_URL}/countdown`,
      splashImageUrl: `${APP_BASE_URL}/splash.png`,
      splashBackgroundColor: "#0053ff",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Countdown Frame",
    openGraph: {
      title: "Countdown Frame",
      description: "The countdown iykyk.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function CountdownPage() {
  return <CountdownApp />;
}
