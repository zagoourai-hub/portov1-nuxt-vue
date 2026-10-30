export function assetPath(url: string) {
  if (typeof window === 'undefined') return url
  const resolved = new URL(url, window.location.href)
  return resolved.origin === window.location.origin ? resolved.pathname + resolved.search + resolved.hash : url
}
