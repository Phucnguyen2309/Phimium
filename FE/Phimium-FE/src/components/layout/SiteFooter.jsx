import { Link } from 'react-router-dom'

import { Container } from '@/components/common'
import { BrandLogo } from '@/components/layout/BrandLogo.jsx'
import { APP_NAME } from '@/constants/app.js'
import { useLanguage } from '@/context/languageContext.js'
import { ROUTES } from '@/routes/paths.js'

export function SiteFooter() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <Container>
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <BrandLogo />

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
              {t('footer.tagline')}
            </p>

            <p className="mt-6 text-xs font-semibold text-slate-400">
              © 2026 {APP_NAME}. {t('footer.rights')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-950">{t('footer.company')}</h3>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <Link
                to={ROUTES.home}
                className="block transition hover:text-blue-950"
              >
                {t('footer.about')}
              </Link>

              <Link
                to={ROUTES.activities}
                className="block transition hover:text-blue-950"
              >
                {t('nav.activities')}
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-950">{t('footer.support')}</h3>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <a
                href="#popular-activities"
                className="block transition hover:text-blue-950"
              >
                {t('footer.helpCenter')}
              </a>

              <a
                href="#popular-activities"
                className="block transition hover:text-blue-950"
              >
                {t('footer.safetyGuide')}
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-950">{t('footer.legal')}</h3>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <a href="#" className="block transition hover:text-blue-950">
                {t('footer.privacy')}
              </a>

              <a href="#" className="block transition hover:text-blue-950">
                {t('footer.contact')}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
