import { Link } from 'react-router-dom'

import { AuthAlert, FormField, PasswordField } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
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
          className="flex w-full items-center justify-center rounded-xl bg-blue-950 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? t('common.processing') : t('auth.login.submit')}
        </button>
      </form>

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
