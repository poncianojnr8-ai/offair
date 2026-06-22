/**
 * Turn a pasted link into an embeddable iframe src for common providers.
 * Returns null if we can't confidently build an embed (caller can fall back
 * to treating the input as a raw URL).
 */
export function toEmbedUrl(input: string): string | null {
  const url = input.trim();
  if (!url) return null;

  // Already an embed URL — use as-is.
  if (/\/embed\//i.test(url) || /player\.(vimeo|twitch)/i.test(url)) return url;

  // Spotify: open.spotify.com/track/ID -> open.spotify.com/embed/track/ID
  const spotify = url.match(
    /open\.spotify\.com\/(track|album|playlist|episode|show|artist)\/([a-zA-Z0-9]+)/
  );
  if (spotify) {
    return `https://open.spotify.com/embed/${spotify[1]}/${spotify[2]}`;
  }

  // Vimeo: vimeo.com/123456 -> player.vimeo.com/video/123456
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return `https://player.vimeo.com/video/${vimeo[1]}`;
  }

  // SoundCloud: use the oEmbed player wrapper.
  if (/soundcloud\.com\//i.test(url)) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(
      url
    )}&color=%23de2c2c&auto_play=false&show_comments=false`;
  }

  // Google Maps share/embed link.
  if (/google\.[^/]+\/maps/i.test(url)) {
    return url.includes("output=embed") ? url : `${url}&output=embed`;
  }

  return null;
}

/** Extract a YouTube video id from any common YouTube URL form. */
export function youtubeId(input: string): string | null {
  const match = input.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}
