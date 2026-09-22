import { STORAGE_KEY } from './constants'
import { TEMPLATES } from '../config'

export function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

// Quota errors are swallowed: a photo too large to persist only costs the
// guest their progress on a reload, never the current flow.
export function saveSession(patch) {
  const next = { ...loadSession(), ...patch }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // see above
  }
  return next
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // nothing to lose
  }
}

export function templateById(id) {
  return TEMPLATES.find((t) => t.id === id) ?? null
}
