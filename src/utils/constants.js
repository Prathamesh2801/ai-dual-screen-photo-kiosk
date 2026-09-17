import { DEFAULT_COVER_FONT, DEFAULT_TEXT_CASE } from './coverFont'


// Must match overlay.png's aspect ratio, or the preview crops while the export
// stretches: COVER_HEIGHT = round(COVER_WIDTH * overlayH / overlayW).
export const COVER_WIDTH = 1500
export const COVER_HEIGHT = 2271
export const COVER_RATIO = COVER_WIDTH / COVER_HEIGHT

export const EXPORT_MAX_SCALE = 4

export const ROUTES = {
  upload: '/',
  editor: '/editor',
  result: '/result',
  tv: '/tv',
}

export const DEFAULT_PERSON = {
  x: 0.5,
  y: 0.52,
  width: 0.6,
}

export const DEFAULT_TEXT = {
  x: 0.5,
  y: 0.86,
  fontScale: 0.075,
  color: '#ffffff',
  fontKey: DEFAULT_COVER_FONT,
  textCase: DEFAULT_TEXT_CASE,
}

export const TEXT_COLORS = [
  '#ffffff',
  '#2b2620',
  '#f4d35e',
  '#c05f3c',
  '#1f2937',
]
