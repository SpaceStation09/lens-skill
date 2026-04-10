import { ProfilePageShell } from "@/features/profile/ProfilePageShell";

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  return <ProfilePageShell handle={handle} />;
}
