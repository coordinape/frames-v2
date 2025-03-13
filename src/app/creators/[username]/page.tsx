import ENSResolver from "./ENSResolver";
import ContractGallery from "~/app/frames/hello/components/ContractGallery";
import { Metadata } from "next";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import { addressIsMember } from "~/app/features/directory/actions";
import MembershipStatus from "~/app/creators/[username]/MembershipStatus";

interface Props {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  // Resolve the basename or address server-side
  const resolution = await resolveBasenameOrAddress(username);

  // Check if the user is a member of the directory
  const isMember = resolution?.address
    ? await addressIsMember(resolution.address)
    : false;

  return (
    <div className="space-y-6">
      <ENSResolver initialValue={username} initialData={resolution} />

      <MembershipStatus
        isMember={isMember}
        address={resolution?.address}
        username={username}
        basename={resolution?.basename}
      />

      <ContractGallery address={resolution?.address || ""} />
    </div>
  );
}

const appUrl = `https://${process.env.VERCEL_URL}`;
// const appUrl = process.env.NEXT_PUBLIC_URL;
// const appUrl = process.env.VERCEL_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "Launch Frame",
    action: {
      type: "launch_frame",
      name: "Join Frame",
      url: `${appUrl}/join`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Join Frame",
    openGraph: {
      title: "Join Frame",
      description: "Join the creatordirectory.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}
