import { Metadata } from "next";
import CreatorsList from "~/app/creators/CreatorsList";

export default function DirectoryPage() {
  return <div><div>donkley</div><CreatorsList /></div>;
}

interface Props {
  params: Promise<{
    username: string;
  }>;
}
// const appUrl = process.env.NEXT_PUBLIC_URL;
// const appUrl = process.env.VERCEL_URL;
const appUrl = `https://${process.env.VERCEL_URL}`;

const frame = ({ username }: { username: string }) => ({
  version: "next",
  imageUrl: `${appUrl}/creators/donkey/${username}/ogimage`,
  button: {
    title: `${username} Profile`,
    action: {
      type: "launch_frame",
      name: "View Creator Profile",
      url: `${appUrl}/creators/donkey/${username}/edit`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
});

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  console.log(username);
  return {
    title: `Creators Profile for ${username}`,
    openGraph: {
      title: `Creators Profile for ${username}`,
      description: `Creators Directory Profile for ${username}.`,
    },
    other: {
      "fc:frame": JSON.stringify(frame({ username })),
    },
  };
}

