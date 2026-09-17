// ─── Host ────────────────────────────────────────────────────────────────────
export const BASE_URL = "http://127.0.0.1";

// ─── Feature flags ───────────────────────────────────────────────────────────
// Every flag has two supported branches. Both must keep working.
export const BG_REMOVAL_ENABLED = false;
export const TEXT_ENABLED = false;
export const UPLOAD_ENABLED = false;
export const TV_ENABLED = false;
export const CAMERA_ENABLED = true;
export const FILE_UPLOAD_ENABLED = false;
export const INSTANT_FINISH = true;

// ─── Camera ──────────────────────────────────────────────────────────────────
export const CAMERA_WIDTH = 1920;
export const CAMERA_HEIGHT = 1080;
export const CAMERA_FACING = "environment";
export const CAMERA_COUNTDOWN_S = 3;
// Mirroring the preview makes it disagree with the saved photo. Leave false.
export const CAMERA_MIRROR_PREVIEW = false;

// ─── Session ─────────────────────────────────────────────────────────────────
export const INSTANT_FINISH_HOLD_MS = 5000;

// ─── Branding ────────────────────────────────────────────────────────────────
export const BRAND_TITLE = "Maxter Today";
export const BRAND_SUBTITLE = "Cover Studio";
export const ATTRACT_HEADING = "Be on the cover";
export const ATTRACT_BODY =
  "Step in front of the camera and we'll put you on the front page.";
export const FOOTER_TEXT = "Design your cover · Beige Editorial Studio";

// ─── Endpoints ───────────────────────────────────────────────────────────────
export const BG_REMOVER_URL = `${BASE_URL}:8004/remove-bg`;
export const IMAGE_API_URL = `${BASE_URL}/Ministack/Birthday/API/api.php`;
export const SSE_URL = `${BASE_URL}/Ministack/Birthday/API/sse.php`;
export const UPLOAD_TIMEOUT_MS = 120000;

// ─── Display wall ────────────────────────────────────────────────────────────
export const TV_REEL_LIMIT = 20;
export const TV_SLIDE_MS = 7000;
// Must match .tv-slide-in / .tv-slide-out durations in index.css.
export const TV_TRANSITION_MS = 900;
