import { Link } from 'react-router-dom'

import { AuthAlert, FormField, OtpInput } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { AuthLayout } from '@/layouts/AuthLayout.jsx'
import { ROUTES } from '@/routes/paths.js'

const formatCountdown = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

function MailBadge() {
  return (
    <div className="relative mx-auto flex h-20 w-20 animate-pop-in items-center justify-center">
      <span className="absolute inset-0 animate-glow-pulse rounded-full bg-yellow-400/20" />
      <span className="absolute inset-2 rounded-full border border-yellow-400/50" />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-950 text-yellow-400 shadow-lg shadow-blue-950/30">
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 7l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </span>
      <span className="absolute -right-0.5 top-1 h-3 w-3 rounded-full bg-yellow-400 ring-4 ring-white animate-twinkle" />
    </div>
  )
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  )
}

export function VerifyEmailView({
  cooldown,
  email,
  error,
  expireMinutes,
  handleEmailChange,
  handleOtpChange,
  handleResend,
  handleSubmit,
  isEmailLocked,
  isResending,
  isVerifying,
  notice,
  otp,
  otpLength,
  otpSent,
  shakeKey,
}) {
  const { t } = useLanguage()
  const canResend = cooldown <= 0 && !isResending

  return (
    <AuthLayout
      title={t('auth.verifyEmail.title')}
      subtitle={t('auth.verifyEmail.subtitle')}
      sideTitle={t('auth.verifyEmail.sideTitle')}
      sideText={t('auth.verifyEmail.sideText')}
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="text-center">
          <MailBadge />

          {isEmailLocked ? (
            <p className="mt-5 text-sm leading-6 text-slate-500">
              {t('auth.verifyEmail.sentTo')}
              <br />
              <span className="font-bold text-blue-950 break-all">{email}</span>
            </p>
          ) : (
            <p className="mt-5 text-sm leading-6 text-slate-500">
              {t('auth.verifyEmail.enterEmail')}
            </p>
          )}
        </div>

        {!isEmailLocked && (
          <FormField
            label={t('auth.email')}
            icon="mail"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            placeholder={t('auth.emailPlaceholder')}
            required
          />
        )}

        {isEmailLocked && !otpSent && !notice && !error && (
          <AuthAlert tone="info">{t('auth.verifyEmail.notVerifiedHint')}</AuthAlert>
        )}
        {notice && <AuthAlert tone="success">{notice}</AuthAlert>}
        {error && <AuthAlert>{error}</AuthAlert>}

        <div>
          <OtpInput
            value={otp}
            onChange={handleOtpChange}
            length={otpLength}
            disabled={isVerifying}
            hasError={Boolean(error)}
            shakeKey={shakeKey}
            autoFocus={isEmailLocked}
          />
          <p className="mt-3 text-center text-xs text-slate-400">
            {t('auth.verifyEmail.expireHint', { minutes: expireMinutes })}
          </p>
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          className="shine flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3.5 text-sm font-black text-blue-950 shadow-lg shadow-yellow-400/30 transition duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isVerifying && <Spinner />}
          {isVerifying ? t('auth.verifyEmail.verifying') : t('auth.verifyEmail.submit')}
        </button>

        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
          <span className="text-slate-500">{t('auth.verifyEmail.noCode')}</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className="inline-flex items-center gap-2 font-bold text-blue-950 underline-offset-4 transition hover:text-yellow-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
          >
            {isResending && <Spinner />}
            {cooldown > 0
              ? t('auth.verifyEmail.resendIn', { time: formatCountdown(cooldown) })
              : t('auth.verifyEmail.resend')}
          </button>
        </div>
      </form>

      <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6 text-sm">
        <Link
          to={ROUTES.register}
          className="font-semibold text-slate-500 transition hover:text-blue-950"
        >
          {t('auth.verifyEmail.changeEmail')}
        </Link>
        <Link
          to={ROUTES.login}
          className="font-bold text-blue-950 transition hover:text-yellow-600"
        >
          {t('auth.verifyEmail.backToLogin')}
        </Link>
      </div>
    </AuthLayout>
  )
}
