import { AuthAlert } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'

import { GoogleSignInButton } from './GoogleSignInButton.jsx'
import { useGoogleAuth } from './useGoogleAuth.js'

/** Khối "hoặc tiếp tục với Google" dùng ở trang Đăng nhập và Đăng ký. */
export function GoogleAuthSection({ mode = 'signin' }) {
  const { t } = useLanguage()
  const { googleError, googleLoading, googleNotice, handleCredential } = useGoogleAuth()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        {t('auth.google.divider')}
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleSignInButton mode={mode} onCredential={handleCredential} disabled={googleLoading} />

      {googleLoading && (
        <p className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-900 border-t-transparent"
          />
          {t('auth.google.processing')}
        </p>
      )}

      {googleNotice && <AuthAlert tone="info">{googleNotice}</AuthAlert>}
      {googleError && <AuthAlert>{googleError}</AuthAlert>}
    </div>
  )
}
