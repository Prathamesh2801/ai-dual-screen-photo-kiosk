import { SSE_URL } from "../config";



export const API_ORIGIN = new URL(SSE_URL).origin;


export function toReachableUrl(raw) {
  if (!raw) return null;
  // data: and blob: URLs have no host to rewrite.
  if (!/^https?:/i.test(raw)) return raw;
  try {
    const u = new URL(raw);
    return `${API_ORIGIN}${u.pathname}${u.search}`;
  } catch {
    return raw;
  }
}
