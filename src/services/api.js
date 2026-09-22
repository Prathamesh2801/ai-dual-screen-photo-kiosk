import axios from 'axios'
import {
  MOCK_DOWNLOAD_URL,
  MOCK_PROCESS_DELAY_MS,
  PROCESS_TIMEOUT_MS,
  PROCESS_URL,
  SUBMIT_TIMEOUT_MS,
  SUBMIT_URL,
  USE_MOCK_SERVER,
} from '../config'
import { MOCK_CHANNEL } from '../utils/constants'
import { blobToDataURL } from '../utils/image'
import { toReachableUrl } from './apiOrigin'

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function dataUrlToBlob(dataUrl) {
  return (await fetch(dataUrl)).blob()
}

// Field names below are unconfirmed — see "Open questions" in CLAUDE.md.

export async function processPhoto({ photo, templateId }) {
  if (USE_MOCK_SERVER) {
    await wait(MOCK_PROCESS_DELAY_MS)
    return photo
  }
  const body = new FormData()
  body.append('image', await dataUrlToBlob(photo), 'photo.jpg')
  body.append('template_id', String(templateId))
  const { data } = await axios.post(PROCESS_URL, body, { timeout: PROCESS_TIMEOUT_MS })
  if (!data?.image_url) throw new Error('The server did not return an image.')
  return toReachableUrl(data.image_url)
}

export async function submitFinal({ form, templateId, image }) {
  if (USE_MOCK_SERVER) {
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
  body.append('name', form.name)
  body.append('email', form.email)
  body.append('company', form.company)
  body.append('template_id', String(templateId))
  body.append('image', image, 'final.jpg')
  await axios.post(SUBMIT_URL, body, { timeout: SUBMIT_TIMEOUT_MS })
}
