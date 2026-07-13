/**
 * Extracts an 11-character YouTube video id from various URL formats or a bare id.
 *
 * Supported inputs:
 *  - https://www.youtube.com/watch?v=VIDEOID
 *  - https://www.youtube.com/watch?v=VIDEOID&t=30s (extra params)
 *  - https://youtu.be/VIDEOID
 *  - https://www.youtube.com/embed/VIDEOID
 *  - A bare 11-char video id (e.g. "dQw4w9WgXcQ")
 *
 * Returns null for non-YouTube / invalid input.
 */
export function parseYoutubeId(input: string): string | null {
  if (!input) return null;

  const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

  // Try parsing as URL first
  let url: URL | null = null;
  try {
    url = new URL(input);
  } catch {
    // Not a URL — check if it's a bare 11-char id
    if (VIDEO_ID_PATTERN.test(input)) {
      return input;
    }
    return null;
  }

  const hostname = url.hostname;

  // Must be a YouTube domain
  const isYouTubeDomain =
    hostname === "www.youtube.com" ||
    hostname === "youtube.com" ||
    hostname === "youtu.be" ||
    hostname === "m.youtube.com";

  if (!isYouTubeDomain) return null;

  // youtu.be/<id>
  if (hostname === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return VIDEO_ID_PATTERN.test(id) ? id : null;
  }

  // youtube.com/watch?v=<id>
  const vParam = url.searchParams.get("v");
  if (vParam) {
    return VIDEO_ID_PATTERN.test(vParam) ? vParam : null;
  }

  // youtube.com/embed/<id>
  const embedMatch = url.pathname.match(/^\/embed\/([A-Za-z0-9_-]{11})(?:[/?]|$)/);
  if (embedMatch) {
    return embedMatch[1];
  }

  return null;
}
