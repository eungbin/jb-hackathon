type LoginStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>

export type LoginRequest = {
  userName: string
  userPassword: string
}

export type AuthUser = {
  userId: number
  userName: string
  userDept: string
  userRank: string
}

const loginStorageKey = 'claimproof-ai-user'
const loginPath = '/user/login'

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.userId === 'number'
    && typeof candidate.userName === 'string'
    && typeof candidate.userDept === 'string'
    && typeof candidate.userRank === 'string'
  )
}

export function readStoredUser(storage: LoginStorage = window.localStorage) {
  const storedValue = storage.getItem(loginStorageKey)

  if (!storedValue) {
    return null
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue)

    return isAuthUser(parsedValue) ? parsedValue : null
  } catch {
    return null
  }
}

export function writeStoredUser(user: AuthUser, storage: LoginStorage = window.localStorage) {
  storage.setItem(loginStorageKey, JSON.stringify(user))
}

export function clearStoredUser(storage: LoginStorage = window.localStorage) {
  storage.removeItem(loginStorageKey)
}

export function canSubmitLogin(form: LoginRequest) {
  return form.userName.trim().length > 0 && form.userPassword.length > 0
}

export async function loginUser(credentials: LoginRequest, fetcher: typeof fetch = fetch) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'
  const response = await fetcher(`${apiBaseUrl}${loginPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error(`Login API request failed: ${response.status}`)
  }

  const user: unknown = await response.json()

  if (!isAuthUser(user)) {
    throw new Error('Login API response is invalid')
  }

  return user
}
