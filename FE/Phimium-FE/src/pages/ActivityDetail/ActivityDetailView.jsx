import { Link } from 'react-router-dom'

import SafetyTermsModal from '@/components/activity/SafetyTermsModal.jsx'
import { Container } from '@/components/common'
import { buildActivityGuidelinesPath, ROUTES } from '@/routes/paths.js'

import { formatDateTime, formatMoney } from './activityDetailData.js'

export function ActivityDetailView({
  activity,
  handleJoinActivity,
  handleJoinClick,
  id,
  joinMessage,
  joining,
  loading,
  safetyTermsAccepted,
  setSafetyTermsAccepted,
  setShowSafetyTerms,
  showSafetyTerms,
}) {
  return (
    <Container className="py-6 sm:py-10">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative min-h-[360px] bg-slate-900">
            <img
              src={activity.thumbnailUrl}
              alt={activity.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                Chi tiết hoạt động
              </p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                {activity.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
                {activity.description}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Thời gian
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {formatDateTime(activity.startTime)}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Địa điểm
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {activity.locationName}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {activity.address}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Phí tham gia</p>
                  <p className="mt-1 text-lg font-bold text-slate-950">
                    {formatMoney(activity.participationFee)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Quy mô nhóm</p>
                  <p className="mt-1 text-lg font-bold text-slate-950">
                    {activity.groupMinSize ?? 4}-{activity.groupMaxSize ?? 6}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Buddy dẫn đoàn
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {activity.hostBuddyName ?? 'Chưa có Buddy phụ trách'}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Loại: {activity.activityType ?? 'Chưa xác định'}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleJoinClick}
                  className="flex-1 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  Tham gia
                </button>
                <Link
                  to={ROUTES.home}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Quay lại
                </Link>
              </div>

              {loading && (
                <p className="text-sm text-slate-500">
                  Đang tải chi tiết...
                </p>
              )}
              {joinMessage && (
                <p className="text-sm font-medium text-slate-600">
                  {joinMessage}
                </p>
              )}

              <div className="flex flex-wrap gap-3 pt-1 text-sm font-semibold">
                <Link
                  to={buildActivityGuidelinesPath(id)}
                  className="text-blue-700 transition hover:text-blue-600"
                >
                  Xem hướng dẫn an toàn
                </Link>
                <Link
                  to={ROUTES.myActivities}
                  className="text-slate-700 transition hover:text-slate-950"
                >
                  Hoạt động của tôi
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SafetyTermsModal
        open={showSafetyTerms}
        checked={safetyTermsAccepted}
        onCheckedChange={setSafetyTermsAccepted}
        onClose={() => {
          setShowSafetyTerms(false)
          setSafetyTermsAccepted(false)
        }}
        onConfirm={handleJoinActivity}
        loading={joining}
      />
    </Container>
  )
}
