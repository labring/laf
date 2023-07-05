export function getAvatarUrl(uid: string) {
  return `${window.location.origin}/v1/user/avatar/${uid}?t=${Date.now()}`;
}
