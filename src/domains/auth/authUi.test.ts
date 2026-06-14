import { describe, expect, it } from 'vitest'

const authUiSources = import.meta.glob(['./pages/*.tsx', './AuthContext.tsx', '../../App.tsx', '../../components/layout/AppShell.tsx'], {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('auth UI wiring', () => {
  it('renders a minimal login screen without account recovery links', () => {
    const source = authUiSources['./pages/LoginPage.tsx']

    expect(source).toContain('아이디')
    expect(source).toContain('비밀번호')
    expect(source).toContain('type="password"')
    expect(source).toContain('로그인')
    expect(source).not.toContain('아이디 찾기')
    expect(source).not.toContain('비밀번호 찾기')
    expect(source).not.toContain('회원가입')
  })

  it('gates the application shell behind local login state', () => {
    const source = authUiSources['../../App.tsx']

    expect(source).toContain('readStoredUser')
    expect(source).toContain('writeStoredUser')
    expect(source).toContain('loginUser')
    expect(source).toContain('AuthProvider')
    expect(source).toContain('LoginPage')
    expect(source).toContain('!user')
    expect(source).toContain('setUser(nextUser)')
  })

  it('wires frontend-only logout from the app shell header', () => {
    const appSource = authUiSources['../../App.tsx']
    const contextSource = authUiSources['./AuthContext.tsx']
    const appShellSource = authUiSources['../../components/layout/AppShell.tsx']

    expect(appSource).toContain('clearStoredUser')
    expect(appSource).toContain('function handleLogout()')
    expect(appSource).toContain('clearStoredUser()')
    expect(appSource).toContain('setUser(null)')
    expect(appSource).toContain('onLogout={handleLogout}')
    expect(contextSource).toContain('logout: () => void')
    expect(contextSource).toContain('logout: onLogout')
    expect(appShellSource).toContain('const { user, logout } = useAuth()')
    expect(appShellSource).toContain('onClick={logout}')
    expect(appShellSource).toContain('로그아웃')
  })

  it('exposes login user information through auth context and app shell', () => {
    const contextSource = authUiSources['./AuthContext.tsx']
    const appShellSource = authUiSources['../../components/layout/AppShell.tsx']

    expect(contextSource).toContain('createContext')
    expect(contextSource).toContain('AuthProvider')
    expect(contextSource).toContain('useAuth')
    expect(appShellSource).toContain('useAuth')
    expect(appShellSource).toContain('user.userName')
    expect(appShellSource).toContain('user.userDept')
    expect(appShellSource).toContain('user.userRank')
  })
})
