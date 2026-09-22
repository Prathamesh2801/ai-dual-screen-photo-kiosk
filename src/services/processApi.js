import { MOCK, MOCK_PROCESS_DELAY_MS, PROCESS_TIMEOUT_MS, PROCESS_URL } from '../config'
import { loadImage } from '../utils/image'
import { toReachableUrl } from './apiOrigin'
import { RequestError, postForm } from './http'

async function dataUrlToBlob(dataUrl) {
  return (await fetch(dataUrl)).blob()
}

// Resolves once the cutout has actually loaded, so the editor never opens on a
// broken image and a CORS problem surfaces here as a retryable error.
export async function processPhoto({ photo, size, signal }) {
  if (MOCK.process) {
    await new Promise((r) => setTimeout(r, MOCK_PROCESS_DELAY_MS))
    return { id: null, cutout: photo }
  }

  const body = new FormData()
  body.append('source', await dataUrlToBlob(photo), 'photo.jpg')
  body.append('size', size)
  const data = await postForm(PROCESS_URL, body, { timeout: PROCESS_TIMEOUT_MS, signal })
  // A PHP warning printed before the JSON arrives here as a plain string.
  if (typeof data !== 'object' || data === null) {
    throw new RequestError('server', 'The photo server sent an unexpected reply.')
  }
  if (!data.success || !data.final_image_url) {
    throw new RequestError('server', data.error || 'The AI could not create your portrait this time.')
  }

  const cutout = toReachableUrl(data.final_image_url)
  try {
    await loadImage(cutout)
  } catch {
    throw new RequestError('image', 'Your portrait was created but couldn’t be downloaded to this tablet.')
  }
  return { id: data.id ?? null, cutout }
}
