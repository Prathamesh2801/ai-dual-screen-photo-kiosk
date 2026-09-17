import { COVER_WIDTH, COVER_HEIGHT, EXPORT_MAX_SCALE } from './constants'
import { TEXT_ENABLED } from '../config'
import { loadImage } from './image'
import { applyTextCase, coverFontShorthand, ensureCoverFont } from './coverFont'


export async function composeCover({ bgSrc, personSrc, overlaySrc, layout }) {
  const [bg, overlay, person] = await Promise.all([
    loadImage(bgSrc),
    loadImage(overlaySrc),
    personSrc ? loadImage(personSrc) : Promise.resolve(null),
    TEXT_ENABLED ? ensureCoverFont(layout.text?.fontKey) : null,
  ])

  let scale = 1
  if (person) {
    const renderedWidthAt1x = layout.person.width * COVER_WIDTH
    if (renderedWidthAt1x > 0) {
      scale = person.naturalWidth / renderedWidthAt1x
    }
  }
  scale = clamp(Math.ceil(scale), 1, EXPORT_MAX_SCALE)

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(COVER_WIDTH * scale)
  canvas.height = Math.round(COVER_HEIGHT * scale)
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.scale(scale, scale)

  ctx.drawImage(bg, 0, 0, COVER_WIDTH, COVER_HEIGHT)

  if (person) {
    const aspect = person.naturalWidth / person.naturalHeight || 1
    const w = layout.person.width * COVER_WIDTH
    const h = w / aspect
    const cx = layout.person.x * COVER_WIDTH
    const cy = layout.person.y * COVER_HEIGHT
    ctx.drawImage(person, cx - w / 2, cy - h / 2, w, h)
  }

  const text = TEXT_ENABLED
    ? applyTextCase(layout.text?.content?.trim(), layout.text?.textCase)
    : null
  if (text) {
    const fontPx = layout.text.fontScale * COVER_WIDTH
    ctx.font = coverFontShorthand(layout.text?.fontKey, fontPx)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const tx = layout.text.x * COVER_WIDTH
    const ty = layout.text.y * COVER_HEIGHT

    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.45)'
    ctx.shadowBlur = fontPx * 0.12
    ctx.shadowOffsetY = fontPx * 0.04
    ctx.lineWidth = Math.max(2, fontPx * 0.03)
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'
    ctx.strokeText(text, tx, ty)
    ctx.fillStyle = layout.text.color || '#ffffff'
    ctx.fillText(text, tx, ty)
    ctx.restore()
  }

  ctx.drawImage(overlay, 0, 0, COVER_WIDTH, COVER_HEIGHT)

  const blob = await canvasToBlob(canvas)
  return {
    blob,
    url: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
    scale,
  }
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to export image.'))),
      'image/png',
    )
  })
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v))
}
