import EditBasenameProfile from "~/app/creators/[username]/edit/EditBasenameProfile";

interface Props {
  params: Promise<{
    username: string;
  }>;
}

export default async function EditProfilePage({ params }: Props) {
  const { username } = await params;

  return <EditBasenameProfile username={username} />;
}
