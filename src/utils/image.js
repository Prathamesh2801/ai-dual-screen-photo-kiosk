

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
