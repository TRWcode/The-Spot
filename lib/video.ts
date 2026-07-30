/**
 * Video hosting adapter.
 *
 * Decision (26-07-2026): build against a swappable adapter now, because there
 * is no Mux/Stream account and no footage yet. Everything in the UI goes
 * through `resolveVideo()`, so switching hosts is a change to THIS FILE ONLY —
 * no component touches a URL directly.
 *
 * To move to Mux:
 *   1. npm i @mux/mux-player-react
 *   2. set PROVIDER = "mux"
 *   3. put playbackId on each item in lib/content.ts
 *   4. swap the <video> in components/ui/HoverVideo.tsx for <MuxPlayer>,
 *      which gives adaptive bitrate + fast-start for free.
 *
 * Cloudflare Stream is the same shape: customerCode + videoId.
 */

export type VideoProvider = "local" | "mux" | "stream" | "youtube";

export const PROVIDER: VideoProvider = "youtube";

/**
 * youtube-nocookie sets no tracking cookie until playback starts, which keeps
 * the page clear of consent obligations for visitors who never press play.
 */
export function youtubeEmbed(id: string, autoplay = true) {
  const q = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${q}`;
}

/**
 * Gates the local hover loops. Only items that actually carry a `clip` path in
 * lib/content get one, so this staying true is safe — a case still waiting on
 * footage simply has no clip and stays a poster.
 *
 * Generate the clips with: node scripts/make-clips.mjs
 */
const CLIPS_AVAILABLE = true;

export type VideoAsset = {
  /** Local/public path — used while PROVIDER is "local". */
  clip?: string;
  /** Mux playback ID or Cloudflare Stream video ID. */
  playbackId?: string;
  poster: string;
};

export type ResolvedVideo = {
  src?: string;
  poster: string;
  /** True when we have nothing playable — the UI must degrade to poster only. */
  posterOnly: boolean;
};

/** Cloudflare Stream customer subdomain. TODO: fill in when the account exists. */
const STREAM_CUSTOMER_CODE = "";

export function resolveVideo(asset: VideoAsset): ResolvedVideo {
  const { poster } = asset;

  switch (PROVIDER) {
    case "mux":
      return asset.playbackId
        ? { src: `https://stream.mux.com/${asset.playbackId}.m3u8`, poster, posterOnly: false }
        : { poster, posterOnly: true };

    case "stream":
      return asset.playbackId && STREAM_CUSTOMER_CODE
        ? {
            src: `https://customer-${STREAM_CUSTOMER_CODE}.cloudflarestream.com/${asset.playbackId}/manifest/video.m3u8`,
            poster,
            posterOnly: false,
          }
        : { poster, posterOnly: true };

    case "local":
    default:
      return asset.clip && CLIPS_AVAILABLE
        ? { src: asset.clip, poster, posterOnly: false }
        : { poster, posterOnly: true };
  }
}

/** Mux/Stream can generate posters; local ones are just files. */
export function posterFor(asset: VideoAsset): string {
  if (PROVIDER === "mux" && asset.playbackId) {
    return `https://image.mux.com/${asset.playbackId}/thumbnail.webp?width=1600`;
  }
  return asset.poster;
}
