import { Link, useNavigate } from 'react-router-dom'

import { Container } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { buildActivityDetailPath, ROUTES } from '@/routes/paths.js'
import { getValidImage } from '@/utils/image.js'

const DEFAULT_RULE_KEYS = ['rule1', 'rule2', 'rule3', 'rule4', 'rule5']

export function ActivityGuidelineView({
  acknowledged,
  activity,
  error,
  guideline,
  id,
  isAuthenticated,
  loading,
  setAcknowledged,
}) {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const emptyText = !isAuthenticated
    ? t('guideline.loginRequired')
    : loading
      ? t('guideline.loading')
      : error
        ? t('guideline.loadError')
        : t('guideline.empty')

  // Xác định câu hướng dẫn theo ngôn ngữ đang chọn
  const getInstructions = () => {
    const raw = guideline?.instructions?.trim()
    const isDefault = !raw || raw.includes('Vui lòng tập trung đúng giờ')
    if (isDefault) {
      return t('guideline.defaultInstructions')
    }
    return raw
  }

  // Xác định danh sách quy tắc an toàn (tách thành từng mục riêng theo ngôn ngữ)
  const getSafetyRules = () => {
    const raw = guideline?.safetyGuidelines?.trim() || ''
    const isDefault = !raw || raw.includes('Tuyệt đối không chia sẻ thông tin')

    if (isDefault) {
      return DEFAULT_RULE_KEYS.map((key) => t(`guideline.${key}`))
    }

    // Nếu là quy tắc tùy chỉnh khác mặc định từ BE
    if (raw) {
      return raw
        .split('\n')
        .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(Boolean)
    }

    return DEFAULT_RULE_KEYS.map((key) => t(`guideline.${key}`))
  }

  const handleAcknowledge = () => {
    if (!acknowledged) return
    navigate(buildActivityDetailPath(id), { state: { guidelineAcknowledged: true } })
  }

  const rulesList = getSafetyRules()
  const instructionsText = getInstructions()
  const activityImage = getValidImage(activity?.thumbnailUrl)

  return (
    <Container className="py-8 sm:py-12">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        {/* Header trang */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-6 sm:px-10">
          <span className="inline-block rounded-full bg-blue-100/70 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-900">
            {t('guideline.pageTitle')}
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {t('guideline.title')}
          </h1>
        </div>

        {/* Nội dung 2 cột cân xứng */}
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Cột trái: Hướng dẫn & Các quy tắc an toàn */}
          <div className="p-6 sm:p-10">
            {/* Mục Hướng dẫn tập trung */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('guideline.instructions')}
              </h2>
              <div className="mt-3 rounded-2xl border border-amber-200/70 bg-amber-50/50 p-4 sm:p-5">
                <p className="text-sm font-medium leading-relaxed text-amber-950 sm:text-base">
                  {instructionsText || emptyText}
                </p>
              </div>
            </section>

            {/* Mục Quy tắc an toàn (từng thẻ đánh số rõ ràng) */}
            <section className="mt-8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('guideline.safetyRules')}
              </h2>

              <div className="mt-4 space-y-3">
                {rulesList.length > 0 ? (
                  rulesList.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 transition duration-200 hover:border-blue-200 hover:bg-slate-50/40"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-xs font-extrabold text-white">
                        {index + 1}
                      </span>
                      <p className="pt-0.5 text-sm font-medium leading-relaxed text-slate-700">
                        {rule}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">{emptyText}</p>
                )}
              </div>
            </section>

            {/* Checkbox xác nhận */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <label className="flex cursor-pointer items-start gap-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 transition duration-200 hover:border-slate-300 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-600"
                />
                <span className="select-none text-sm font-medium leading-relaxed text-slate-800">
                  {t('guideline.acknowledge')}
                </span>
              </label>

              <button
                type="button"
                disabled={!acknowledged || !guideline}
                onClick={handleAcknowledge}
                className="mt-5 w-full rounded-2xl bg-blue-950 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-950/15 transition duration-200 hover:bg-blue-900 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('guideline.acknowledgeButton')}
              </button>
            </div>
          </div>

          {/* Cột phải: Xem trước hoạt động (Activity Preview) & Nút điều hướng */}
          <div className="border-t border-slate-200 bg-slate-50/70 p-6 sm:p-10 lg:border-l lg:border-t-0">
            <div className="lg:sticky lg:top-8">
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                {/* Ảnh tour */}
                {activityImage ? (
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 sm:h-56">
                    <img
                      src={activityImage}
                      alt={activity?.title || ''}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-blue-950 to-blue-900 text-sm font-bold text-white/80">
                    Phimium Experience
                  </div>
                )}

                {/* Thông tin tour */}
                <div className="p-5 sm:p-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    {t('guideline.activityInfo')}
                  </span>

                  <h3 className="mt-1.5 font-display text-lg font-bold text-slate-900 sm:text-xl">
                    {activity?.title || t('guideline.loading')}
                  </h3>

                  {activity?.meetingPoint && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs">
                      <span className="font-bold text-slate-500">
                        {t('guideline.meetingPoint')}:
                      </span>{' '}
                      <span className="font-semibold text-slate-800">
                        {activity.meetingPoint}
                      </span>
                    </div>
                  )}

                  {activity?.price != null && (
                    <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-3">
                      <span className="text-xs text-slate-500">
                        {t('common.price')}
                      </span>
                      <span className="text-base font-extrabold text-blue-950">
                        {Number(activity.price).toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Nút hành động */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Link
                  to={buildActivityDetailPath(id)}
                  className="flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  {t('guideline.backToDetail')}
                </Link>
                <Link
                  to={ROUTES.userDashboard}
                  className="flex flex-1 items-center justify-center rounded-xl bg-blue-950 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-900"
                >
                  {t('activityDetail.myActivities')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
