
import acuminUrl from '../assets/fonts/acumin-variable-concept.otf'
import cafetaUrl from '../assets/fonts/cafeta.ttf'


const FALLBACK = "Georgia, 'Times New Roman', serif"

export const COVER_FONTS = {
  acumin: {
    label: 'Acumin',
    family: 'Acumin Variable Concept',
    source: acuminUrl,

    weightRange: '100 900',
    weight: 600,
    style: 'normal',
    fallback: FALLBACK,
  },

  cafeta: {
    label: 'Cafeta',
    family: 'cafeta',
    source: cafetaUrl,
    weightRange: '400',
    weight: 400,
    style: 'normal',
    fallback: FALLBACK,
  },
}

export const DEFAULT_COVER_FONT = 'acumin'

export const COVER_FONT_OPTIONS = Object.entries(COVER_FONTS).map(([key, font]) => ({
  key,
  ...font,
}))

export function coverFont(key) {
  return COVER_FONTS[key] || COVER_FONTS[DEFAULT_COVER_FONT]
}

export function coverFontStack(key) {
  const font = coverFont(key)
  return `'${font.family}', ${font.fallback}`
}

export function coverFontShorthand(key, sizePx) {
  const font = coverFont(key)
  return `${font.weight} ${sizePx}px ${coverFontStack(key)}`
}


const loads = new Map()

export function ensureCoverFont(key) {
  const resolvedKey = COVER_FONTS[key] ? key : DEFAULT_COVER_FONT
  const cached = loads.get(resolvedKey)
  if (cached) return cached

  const font = COVER_FONTS[resolvedKey]
  let promise

  if (typeof document === 'undefined' || typeof FontFace === 'undefined') {
    promise = Promise.resolve(false)
  } else {
    const face = new FontFace(font.family, `url(${font.source})`, {
      weight: font.weightRange,
      style: font.style,
      display: 'swap',
    })
    promise = face
      .load()
      .then((loaded) => {
        document.fonts.add(loaded)
        return true
      })
      .catch((err) => {
        console.warn(`Could not load the cover font "${font.family}".`, err)
        return false
      })
  }

  loads.set(resolvedKey, promise)
  return promise
}

export function ensureAllCoverFonts() {
  return Promise.all(Object.keys(COVER_FONTS).map(ensureCoverFont))
}


export const TEXT_CASES = {
  upper: { label: 'AA', hint: 'UPPERCASE', transform: (s) => s.toUpperCase() },
  original: { label: 'Aa', hint: 'As typed', transform: (s) => s },
  lower: { label: 'aa', hint: 'lowercase', transform: (s) => s.toLowerCase() },
}

export const DEFAULT_TEXT_CASE = 'upper'

export const TEXT_CASE_OPTIONS = Object.entries(TEXT_CASES).map(([key, value]) => ({
  key,
  ...value,
}))

export function applyTextCase(text, caseKey) {
  if (!text) return text
  const mode = TEXT_CASES[caseKey] || TEXT_CASES[DEFAULT_TEXT_CASE]
  return mode.transform(text)
}
