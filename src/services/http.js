import axios from 'axios'

// kind: 'network' | 'timeout' | 'server' | 'image' | 'canceled'
export class RequestError extends Error {
  constructor(kind, message) {
    super(message)
    this.kind = kind
  }
}

// Every request goes through here so failures reach the guest as one plain
// sentence with a kind the UI can act on, never a raw axios message.
export async function postForm(url, body, { timeout, signal } = {}) {
  if (!navigator.onLine) {
    throw new RequestError('network', 'This tablet is offline. Check the Wi-Fi connection.')
  }
  try {
    const { data } = await axios.post(url, body, { timeout, signal })
    return data
  } catch (err) {
    throw toRequestError(err)
  }
}

function toRequestError(err) {
  if (axios.isCancel(err)) return new RequestError('canceled', 'Cancelled.')
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    return new RequestError('timeout', 'The AI is taking much longer than usual.')
  }
  if (!err.response) {
    return new RequestError('network', 'We couldn’t reach the photo server. Check the Wi-Fi connection.')
  }
  const { status, data } = err.response
  if (status === 413) {
    return new RequestError('server', 'This photo is too large to upload. Please take another.')
  }
  return new RequestError('server', data?.error || `The photo server ran into a problem (error ${status}).`)
}
