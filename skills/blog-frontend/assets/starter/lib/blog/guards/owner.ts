export function isOwnerAddress(input: {
  ownerAddress?: string | null;
  profileAddress?: string | null;
}) {
  const owner = input.ownerAddress?.toLowerCase();
  const profile = input.profileAddress?.toLowerCase();
  if (!owner || !profile) return false;
  return owner === profile;
}
