import { SSE_URL } from "../config";
import { toReachableUrl } from "./apiOrigin";




function coverIdFrom(url) {
  try {
    const u = new URL(url);
    return u.searchParams.get("file") || u.pathname.split("/").pop() || url;
  } catch {
    return url;
  }
}


export function parseCoverFrame(raw) {
  let frame;
  try {
    frame = JSON.parse(raw);
  } catch {
    return null;
  }

  if (String(frame?.Status).toLowerCase() !== "play") return null;

  const imageUrl = toReachableUrl(frame.Play);
  if (!imageUrl) return null;

  return {
    id: coverIdFrom(frame.Play),
    imageUrl,
    downloadUrl: toReachableUrl(frame.Download),
  };
}


export function subscribeToCovers({ onCover, onStatus }) {
  const source = new EventSource(SSE_URL);

  onStatus?.("connecting");

  source.onopen = () => onStatus?.("live");

  source.onmessage = (event) => {
    const cover = parseCoverFrame(event.data);
    if (cover) {
      onStatus?.("live");
      onCover(cover);
    }
  };

  source.onerror = () => {
    onStatus?.(
      source.readyState === EventSource.CLOSED ? "offline" : "reconnecting"
    );
  };

  return () => source.close();
}
