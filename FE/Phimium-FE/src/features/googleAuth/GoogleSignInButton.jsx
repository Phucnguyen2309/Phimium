import { useEffect, useRef, useState } from 'react'

import { GOOGLE_CLIENT_ID } from '@/constants/app.js'
import { useLanguage } from '@/context/languageContext.js'

import { loadGoogleScript } from './loadGoogleScript.js'

/**
 * Nút "Đăng nhập với Google" chính chủ (Google Identity Services).
 * onCredential(credential): nhận Google ID token để gửi lên Backend.
 * mode: 'signin' | 'signup' (chỉ đổi chữ trên nút).
 */
export function GoogleSignInButton({ onCredential, mode = 'signin', disabled = false }) {
  const { t, language } = useLanguage()
  const containerRef = useRef(null)
  const callbackRef = useRef(onCredential)
  const [status, setStatus] = useState(GOOGLE_CLIENT_ID ? 'loading' : 'missing-config')

  // Luôn gọi callback mới nhất mà không phải khởi tạo lại Google
  useEffect(() => {
    callbackRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    let cancelled = false

    loadGoogleScript()
      .then((google) => {
        const container = containerRef.current
        if (cancelled || !container) return

        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => callbackRef.current?.(response.credential),
          ux_mode: 'popup',
          context: mode === 'signup' ? 'signup' : 'signin',
        })

        container.innerHTML = ''
        google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: mode === 'signup' ? 'signup_with' : 'signin_with',
          logo_alignment: 'center',
          width: Math.min(Math.round(container.offsetWidth) || 400, 400),
          locale: language,
        })

        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [mode, language])

  if (status === 'missing-config') {
    return import.meta.env.DEV ? (
      <p className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-center text-xs text-slate-500">
        {t('auth.google.missingConfig')}
      </p>
    ) : null
  }

  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
      {status === 'loading' && <div className="skeleton h-11 w-full rounded-full" />}
      {status === 'error' && (
        <p className="text-center text-xs text-red-600">{t('auth.google.loadError')}</p>
      )}
      <div
        ref={containerRef}
        className={`flex min-h-11 justify-center ${status === 'ready' ? '' : 'hidden'}`}
      />
    </div>
  )
}
