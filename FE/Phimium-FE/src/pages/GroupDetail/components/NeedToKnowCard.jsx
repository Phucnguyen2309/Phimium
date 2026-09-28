import { useLanguage } from '@/context/languageContext.js'

export function NeedToKnowCard() {
  const { t } = useLanguage()

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-slate-950">{t('groupDetail.needToKnow.title')}</h2>

      <div className="mt-6 space-y-5">
        <div className="flex gap-3">
          <span className="mt-1 text-blue-600">ⓘ</span>
          <div>
            <h3 className="font-black text-slate-800">{t('groupDetail.needToKnow.items')}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {t('groupDetail.needToKnow.itemsText')}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="mt-1 text-slate-500">✓</span>
          <div>
            <h3 className="font-black text-slate-800">{t('groupDetail.needToKnow.onTime')}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {t('groupDetail.needToKnow.onTimeText')}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="mt-1 text-slate-500">☁</span>
          <div>
            <h3 className="font-black text-slate-800">{t('groupDetail.needToKnow.location')}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {t('groupDetail.needToKnow.locationText')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
