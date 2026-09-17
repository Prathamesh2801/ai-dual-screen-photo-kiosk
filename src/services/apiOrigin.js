import { IMAGE_API_URL } from "../config";



export const API_ORIGIN = new URL(IMAGE_API_URL).origin;


export function toReachableUrl(raw) {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return `${API_ORIGIN}${u.pathname}${u.search}`;
  } catch {
    return raw;
  }
}
