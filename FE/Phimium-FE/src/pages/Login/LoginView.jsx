import { Link } from 'react-router-dom'

import { AuthAlert, FormField, PasswordField } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { GoogleAuthSection } from '@/features/googleAuth/GoogleAuthSection.jsx'
import { AuthLayout } from '@/layouts/AuthLayout.jsx'
import { ROUTES } from '@/routes/paths.js'

export function LoginView({
  email,
  error,
  handleLogin,
  isLoading,
  password,
  setEmail,
  setPassword,
  successMessageKey,
}) {
  const { t } = useLanguage()

  return (
    <AuthLayout
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      sideTitle={t('auth.login.sideTitle')}
      sideText={t('auth.login.sideText')}
    >
      <form onSubmit={handleLogin} className="space-y-5">
        {successMessageKey && !error && (
          <AuthAlert tone="success">{t(successMessageKey)}</AuthAlert>
        )}

        {error && <AuthAlert>{error}</AuthAlert>}

        <FormField
          label={t('auth.email')}
          icon="mail"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t('auth.emailPlaceholder')}
          required
        />

        <PasswordField
          label={t('auth.password')}
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="shine flex w-full items-center justify-center gap-2 rounded-xl bg-blue-950 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-950/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-900 hover:shadow-xl hover:shadow-blue-950/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading && (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          )}
          {isLoading ? t('common.processing') : t('auth.login.submit')}
        </button>
      </form>

      <div className="mt-6">
        <GoogleAuthSection mode="signin" />
      </div>

      <p className="mt-8 text-center text-sm text-slate-600">
        {t('auth.login.noAccount')}{' '}
        <Link
          to={ROUTES.register}
          className="font-bold text-blue-900 underline decoration-yellow-400 decoration-2 underline-offset-4 hover:text-blue-700"
        >
          {t('auth.login.registerLink')}
        </Link>
      </p>
    </AuthLayout>
  )
}
