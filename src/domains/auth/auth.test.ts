import { describe, expect, it } from 'vitest'
import { canSubmitLogin, clearStoredUser, loginUser, readStoredUser, writeStoredUser } from './auth'

function createStorage(initialValue?: string) {
  const values = new Map<string, string>()

  if (initialValue) {
    values.set('claimproof-ai-user', initialValue)
  }

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
    removeItem: (key: string) => {
      values.delete(key)
    },
  }
}

describe('auth state helpers', () => {
  it('reads and writes the login user in local storage', () => {
    const storage = createStorage()
    const user = { userId: 1, userName: '홍길동', userDept: '마케팅팀', userRank: '대리' }

    expect(readStoredUser(storage)).toBeNull()

    writeStoredUser(user, storage)

    expect(readStoredUser(storage)).toEqual(user)

    clearStoredUser(storage)

    expect(readStoredUser(storage)).toBeNull()
  })

  it('ignores malformed stored user data', () => {
    expect(readStoredUser(createStorage('not-json'))).toBeNull()
    expect(readStoredUser(createStorage(JSON.stringify({ userName: '홍길동' })))).toBeNull()
  })

  it('only allows login submit when both id and password are entered', () => {
    expect(canSubmitLogin({ userName: '', userPassword: 'secret' })).toBe(false)
    expect(canSubmitLogin({ userName: 'compliance', userPassword: '' })).toBe(false)
    expect(canSubmitLogin({ userName: ' compliance ', userPassword: 'secret' })).toBe(true)
  })

  it('posts login credentials to /user/login and returns user information', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, init) => {
      calls.push({ url: String(url), init })

      return new Response(JSON.stringify({ userId: 1, userName: '홍길동', userDept: '마케팅팀', userRank: '대리' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const user = await loginUser({ userName: '홍길동', userPassword: 'password123' }, fetcher)

    expect(calls[0].url).toBe('/api/user/login')
    expect(calls[0].init?.method).toBe('POST')
    expect(calls[0].init?.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(calls[0].init?.body).toBe(JSON.stringify({ userName: '홍길동', userPassword: 'password123' }))
    expect(user).toEqual({ userId: 1, userName: '홍길동', userDept: '마케팅팀', userRank: '대리' })
  })
})
