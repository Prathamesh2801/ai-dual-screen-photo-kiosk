// ─── Server ──────────────────────────────────────────────────────────────────
export const BASE_URL = "http://192.168.1.3";

// TODO: confirm exact paths and payloads with the backend.
export const SUBMIT_URL = `${BASE_URL}/api/submit`;
export const SSE_URL = `${BASE_URL}/api/stream`;
export const SUBMIT_TIMEOUT_MS = 120000;

// ─── Mode ────────────────────────────────────────────────────────────────────
// While true no server is called: submissions resolve locally and the TV is fed
// by a fake stream, so the whole flow can be built and demoed before the backend
// exists. Turn off once the real endpoints are live.
export const USE_MOCK_SERVER = true;

// ─── Camera (tablet) ─────────────────────────────────────────────────────────
export const CAMERA_WIDTH = 1920;
export const CAMERA_HEIGHT = 1080;
// Front camera — the guest is photographing themselves.
export const CAMERA_FACING = "user";
export const CAMERA_COUNTDOWN_S = 3;
// Mirroring the preview makes it disagree with the saved photo. Leave false.
export const CAMERA_MIRROR_PREVIEW = false;
// Capture frame shape. TODO: match to whatever the templates expect.
export const CAPTURE_RATIO = 3 / 4;

// ─── TV display ──────────────────────────────────────────────────────────────
// How long a finished result holds the screen before the TV returns to idle.
export const RESULT_HOLD_MS = 20000;
// Longest the TV waits for a result before showing a timeout state.
export const GENERATION_TIMEOUT_MS = 90000;
export const TV_TRANSITION_MS = 900;

// ─── Branding ────────────────────────────────────────────────────────────────
export const BRAND_TITLE = "Photo Kiosk";
export const BRAND_SUBTITLE = "AI Portrait Studio";
export const FOOTER_TEXT = "";
