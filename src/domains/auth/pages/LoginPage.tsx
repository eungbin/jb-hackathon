import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Button } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'
import { canSubmitLogin } from '../auth'
import type { LoginRequest } from '../auth'

type LoginPageProps = {
  onLogin: (credentials: LoginRequest) => Promise<void>
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [form, setForm] = useState<LoginRequest>({ userName: '', userPassword: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const canSubmit = canSubmitLogin(form)

  return (
    <main className={`flex min-h-screen items-center justify-center ${uiTokens.color.page} px-5 py-8`}>
      <section className={`w-full max-w-sm ${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} ${uiTokens.spacing.card} ${uiTokens.shadow.panel}`}>
        <div className="mb-6 flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center ${uiTokens.radius.panel} ${uiTokens.color.primaryBg} text-white`}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className={uiTokens.typography.cardTitle}>ClaimProof AI</p>
            <p className={uiTokens.typography.helper}>준법관리자 로그인</p>
          </div>
        </div>

        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()

            if (canSubmit) {
              setErrorMessage('')
              setIsSubmitting(true)
              onLogin(form).catch(() => {
                setErrorMessage('로그인에 실패했습니다. 아이디와 비밀번호를 확인해 주세요.')
              }).finally(() => {
                setIsSubmitting(false)
              })
            }
          }}
        >
          <label className={`grid ${uiTokens.spacing.field} ${uiTokens.typography.label}`}>
            아이디
            <input
              className={`h-10 ${uiTokens.radius.control} border ${uiTokens.color.borderStrong} ${uiTokens.color.surface} px-3 text-sm font-normal ${uiTokens.color.headingText} outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100`}
              value={form.userName}
              autoComplete="username"
              onChange={(event) => setForm((current) => ({ ...current, userName: event.target.value }))}
            />
          </label>

          <label className={`grid ${uiTokens.spacing.field} ${uiTokens.typography.label}`}>
            비밀번호
            <input
              className={`h-10 ${uiTokens.radius.control} border ${uiTokens.color.borderStrong} ${uiTokens.color.surface} px-3 text-sm font-normal ${uiTokens.color.headingText} outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100`}
              type="password"
              value={form.userPassword}
              autoComplete="current-password"
              onChange={(event) => setForm((current) => ({ ...current, userPassword: event.target.value }))}
            />
          </label>

          {errorMessage && <p className={`${uiTokens.typography.helper} ${uiTokens.color.danger}`}>{errorMessage}</p>}

          <Button className="mt-2 w-full" type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? '로그인 중' : '로그인'}
          </Button>
        </form>
      </section>
    </main>
  )
}
