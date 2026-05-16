/** True when the product has a real image URL from the API (not a mock placeholder). */
export function hasProductImage(url: string | null | undefined): boolean {
  if (!url?.trim()) {
    return false;
  }

  const trimmed = url.trim();

  return (
    (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/storage")) &&
    !trimmed.includes("picsum.photos")
  );
}
