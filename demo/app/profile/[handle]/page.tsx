import { ProfilePageShell } from "../../../features/profile/ProfilePageShell";

export default function ProfilePage({
  params,
}: {
  params: { handle: string };
}) {
  return <ProfilePageShell handle={params.handle} />;
}
