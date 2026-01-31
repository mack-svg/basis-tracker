import { v4 as uuidv4 } from 'uuid'

const USER_ID_KEY = 'basis_tracker_user_id'
const SAVED_ZIP_KEY = 'basis_tracker_saved_zip'

export function getUserId(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  let userId = localStorage.getItem(USER_ID_KEY)
  if (!userId) {
    userId = uuidv4()
    localStorage.setItem(USER_ID_KEY, userId)
  }
  return userId
}

export function getSavedZip(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem(SAVED_ZIP_KEY)
}

export function saveZip(zip: string): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem(SAVED_ZIP_KEY, zip)
}
