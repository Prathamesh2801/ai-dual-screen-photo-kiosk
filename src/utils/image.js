

export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read the selected file.'))
    reader.readAsDataURL(file)
  })
}


export function blobToDataURL(blob) {
  return fileToDataURL(blob)
}


export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image failed to load.'))
    img.src = src
  })
}


export async function getAspectRatio(src) {
  const img = await loadImage(src)
  return img.naturalWidth / img.naturalHeight
}


export function canvasToBlob(canvas, type = 'image/jpeg', quality) {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not create the image.'))),
      type,
      quality,
    ),
  )
}


export function coverPlacement(win, aspect) {
  const w = Math.max(win.w, win.h * aspect)
  return { x: win.x + (win.w - w) / 2, y: win.y, w }
}


export async function composeFinal(template, cutoutSrc, placement, quality) {
  const [frame, cutout] = await Promise.all([
    loadImage(template.src),
    loadImage(cutoutSrc),
  ])
  const canvas = document.createElement('canvas')
  canvas.width = template.width
  canvas.height = template.height
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(frame, 0, 0, template.width, template.height)

  const { x, y, w, h } = template.window
  const cutoutH = placement.w * (cutout.naturalHeight / cutout.naturalWidth)
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.drawImage(cutout, placement.x, placement.y, placement.w, cutoutH)
  ctx.restore()

  return canvasToBlob(canvas, 'image/jpeg', quality)
}


export async function shrinkPhoto(file, maxEdge, quality) {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    URL.revokeObjectURL(url)
  }
}
