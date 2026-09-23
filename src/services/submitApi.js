import { MOCK, MOCK_DOWNLOAD_URL, SUBMIT_TIMEOUT_MS, SUBMIT_URL } from '../config'
import { MOCK_CHANNEL } from '../utils/constants'
import { blobToDataURL } from '../utils/image'
import { postForm } from './http'

export async function submitFinal({ form, templateId, processId, image }) {
  if (MOCK.submit) {
    const channel = new BroadcastChannel(MOCK_CHANNEL)
    channel.postMessage({
      // Not crypto.randomUUID(): it only exists on https, and the tablet runs
      // over plain LAN http.
      id: String(Date.now()),
      image_url: await blobToDataURL(image),
      download_url: MOCK_DOWNLOAD_URL,
    })
    channel.close()
    return
  }

  const body = new FormData()
  body.append('image', image, 'final.jpg')
  body.append('data', JSON.stringify({ ...form, template_id: templateId, process_id: processId ?? null }))
  await postForm(SUBMIT_URL, body, { timeout: SUBMIT_TIMEOUT_MS })
}
