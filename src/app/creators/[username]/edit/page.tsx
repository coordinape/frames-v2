import ProfileEditor from "./ProfileEditor";

interface Props {
  params: Promise<{
    username: string;
  }>;
}

export default async function EditProfilePage({ params }: Props) {
  const { username } = await params;

  return (
    <div>
      <ProfileEditor username={username} />
    </div>
  );
}
