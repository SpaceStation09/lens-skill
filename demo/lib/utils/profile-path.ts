export function getProfileHref(username?: string | null) {
  return username ? `/profile/${username}` : "/auth";
}
