import { Link } from 'react-router-dom'

import { AuthAlert, FormField } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { AuthLayout } from '@/layouts/AuthLayout.jsx'
import { ROUTES } from '@/routes/paths.js'

export function CompleteProfileView({
  email,
  error,
  formData,
  handleChange,
  handleSubmit,
  hasToken,
  isLoading,
}) {
  const { t } = useLanguage()

  return (
    <AuthLayout
      title={t('auth.completeProfile.title')}
      subtitle={t('auth.completeProfile.subtitle')}
      sideTitle={t('auth.register.heroTitle')}
      sideText={t('auth.register.heroText')}
    >
      {!hasToken ? (
        <div className="space-y-6">
          <AuthAlert>{t('auth.completeProfile.missingToken')}</AuthAlert>
          <Link
            to={ROUTES.login}
            className="flex w-full items-center justify-center rounded-xl bg-blue-950 px-4 py-3.5 text-sm font-black text-white transition hover:bg-blue-900"
          >
            {t('auth.completeProfile.backToLogin')}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <AuthAlert>{error}</AuthAlert>}

          {email && (
            <AuthAlert tone="info">{t('auth.completeProfile.googleAccount', { email })}</AuthAlert>
          )}

          <FormField
            label={t('auth.register.fullName')}
            icon="user"
            type="text"
            name="fullName"
            autoComplete="name"
            value={formData.fullName}
            onChange={handleChange}
            placeholder={t('auth.register.fullNamePlaceholder')}
            maxLength={100}
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
              pattern="0[35789][0-9]{8}"
              title={t('auth.completeProfile.phoneHint')}
              required
            />

            <FormField
              label={t('auth.register.birthdate')}
              icon="calendar"
              type="date"
              name="birthday"
              autoComplete="bday"
              value={formData.birthday}
              onChange={handleChange}
              max={new Date().toISOString().slice(0, 10)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="shine flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3.5 text-sm font-black text-blue-950 shadow-lg shadow-yellow-400/30 transition duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading && (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
            )}
            {isLoading ? t('common.processing') : t('auth.completeProfile.submit')}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
