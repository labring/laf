export function getAvatarUrl(uid?: string, updatedAt?: string) {
  return `${window.location.origin}/v1/user/avatar/${uid}?t=${updatedAt}`;
}
