import frame1 from "./assets/templates/frame_1.webp";
import frame2 from "./assets/templates/frame_2.webp";
import frame3 from "./assets/templates/frame_3.webp";

// ─── Server ──────────────────────────────────────────────────────────────────
export const BASE_URL = "http://192.168.1.88/ministack/Capgemini_USA_Photobooth";

export const PROCESS_URL = `${BASE_URL}/gpt.php`;
// TODO: confirm paths and payloads with the backend.
export const SUBMIT_URL = `${BASE_URL}/api/submit`;
export const SSE_URL = `${BASE_URL}/api/stream`;

// Typical generation time, in seconds. Shown to the guest as the estimate and
// used to pace the progress bar. TIMEOUT is when the tablet gives up and offers
// a retry; keep it well past the upper end.
export const PROCESS_TYPICAL_S = [25, 45];
export const PROCESS_TIMEOUT_MS = 900000;
export const SUBMIT_TIMEOUT_MS = 60000;

// ─── Mock ────────────────────────────────────────────────────────────────────
// Per feature, so each goes live as its endpoint does. `submit` and `stream`
// must match: the mock submit reaches a /tv tab in the same browser over
// BroadcastChannel, and only the mock stream listens there.
export const MOCK = {
  process: false,
  submit: true,
  stream: true,
};
export const MOCK_PROCESS_DELAY_MS = 2500;
export const MOCK_DOWNLOAD_URL = "https://www.capgemini.com";

// ─── Templates ───────────────────────────────────────────────────────────────
// `window` is the photo slot, in the frame's own pixels. The cutout is clipped
// to it. `size` is sent to gpt.php: the closest ratio it offers to the window
// (1024x1024 · 1024x1536 · 1536x1024).
export const TEMPLATES = [
  { id: 1, name: "Vegas Nights", src: frame1, width: 1200, height: 1920, window: { x: 257, y: 316, w: 686, h: 1041 }, size: "1024x1536" },
  { id: 2, name: "The Strip", src: frame2, width: 1200, height: 1920, window: { x: 260, y: 321, w: 680, h: 1031 }, size: "1024x1536" },
  { id: 3, name: "Skyline Group", src: frame3, width: 1920, height: 1200, window: { x: 450, y: 195, w: 1020, h: 680 }, size: "1536x1024" },
];

// ─── Photo (tablet) ──────────────────────────────────────────────────────────
// Which lens the native camera opens on: "user" (front) or "environment".
export const CAMERA_FACING = "user";
// Native-camera photos are 12MP+; they are shrunk to this long edge before
// upload and before being held in localStorage.
export const PHOTO_MAX_EDGE = 2048;
export const PHOTO_JPEG_QUALITY = 0.9;

// ─── Editor ──────────────────────────────────────────────────────────────────
// Cutout width limits, as a multiple of the photo window's width.
export const EDITOR_MIN_SCALE = 0.3;
export const EDITOR_MAX_SCALE = 3;
export const FINAL_JPEG_QUALITY = 0.92;

// ─── Tablet ──────────────────────────────────────────────────────────────────
// The thank-you screen returns to the form on its own after this long.
export const SENT_RESET_MS = 12000;

// ─── TV display ──────────────────────────────────────────────────────────────
// How long a finished result holds the screen before the TV returns to idle.
export const RESULT_HOLD_MS = 30000;
// No frame (not even a heartbeat) for this long → the stream is treated as dead
// and reopened.
export const SSE_STALE_MS = 30000;

// ─── Branding ────────────────────────────────────────────────────────────────
export const BRAND_TITLE = "AI Moments";
