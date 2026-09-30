import { Link } from 'react-router-dom'

import { AuthAlert, FormField, PasswordField } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { GoogleAuthSection } from '@/features/googleAuth/GoogleAuthSection.jsx'
import { AuthLayout } from '@/layouts/AuthLayout.jsx'
import { ROUTES } from '@/routes/paths.js'

export function RegisterView({
  error,
  formData,
  handleChange,
  handleRegister,
  isLoading,
}) {
  const { t } = useLanguage()

  return (
    <AuthLayout
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
      sideTitle={t('auth.register.heroTitle')}
      sideText={t('auth.register.heroText')}
    >
      <form onSubmit={handleRegister} className="space-y-5">
        {error && <AuthAlert>{error}</AuthAlert>}

        <FormField
          label={t('auth.register.fullName')}
          icon="user"
          type="text"
          name="fullname"
          autoComplete="name"
          value={formData.fullname}
          onChange={handleChange}
          placeholder={t('auth.register.fullNamePlaceholder')}
          required
        />

        <FormField
          label={t('auth.email')}
          icon="mail"
          type="email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={t('auth.emailPlaceholder')}
          required
        />

        <PasswordField
          label={t('auth.password')}
          name="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          hint={t('auth.register.passwordHint')}
          required
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            label={t('auth.register.phone')}
            icon="phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0901234567"
            required
          />

          <FormField
            label={t('auth.register.birthdate')}
            icon="calendar"
            type="date"
            name="birthdate"
            autoComplete="bday"
            value={formData.birthdate}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="shine flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3.5 text-sm font-black text-blue-950 shadow-lg shadow-yellow-400/30 transition duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-xl hover:shadow-yellow-400/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading && (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          )}
          {isLoading ? t('common.processing') : t('auth.register.submit')}
        </button>

        <p className="text-center text-xs leading-5 text-slate-500">
          {t('auth.register.safetyNote')}
        </p>
      </form>

      <div className="mt-6">
        <GoogleAuthSection mode="signup" />
      </div>

      <p className="mt-8 text-center text-sm text-slate-600">
        {t('auth.register.hasAccount')}{' '}
        <Link
          to={ROUTES.login}
          className="font-bold text-blue-900 underline decoration-yellow-400 decoration-2 underline-offset-4 hover:text-blue-700"
        >
          {t('auth.register.loginLink')}
        </Link>
      </p>
    </AuthLayout>
  )
}
