import { Container } from '@/components/common'

import { formatActivityType } from './ActivityMapper.js'
import ActivityCard from './components/ActivityCard.jsx'
import { useActivity } from './useActivity.js'
import { HomeFooter } from '../Home/components/HomeFooter.jsx'

export function ActivityView() {
  const {
    activityTypes,
    paginatedActivities,
    selectedType,
    setSelectedType,
    searchText,
    setSearchText,
    page,
    setPage,
    totalPages,
    viewMode,
    setViewMode,
    loading,
    error,
  } = useActivity()

  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <section className="rounded-[32px] border border-emerald-100 bg-white/95 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-950">
                Khám phá trải nghiệm địa phương
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Những buổi gặp gỡ được chọn lọc cho vibe chiều vui vẻ. Tham gia
                workshop, cafe và hoạt động cùng những người cùng gu với bạn.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black transition ${
                  viewMode === 'GRID'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-emerald-100 bg-white text-slate-500 hover:bg-emerald-50'
                }`}
              >
                ▦
              </button>

              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black transition ${
                  viewMode === 'LIST'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-emerald-100 bg-white text-slate-500 hover:bg-emerald-50'
                }`}
              >
                ☰
              </button>
            </div>
          </div>

          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-md items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
              <span className="text-emerald-700">⌕</span>

              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Tìm hoạt động..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {activityTypes.map((type) => {
                const isActive = selectedType === type

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`rounded-full px-4 py-2 text-xs font-black transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'border border-emerald-100 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    {type === 'ALL' ? 'Tất cả loại' : formatActivityType(type)}
                  </button>
                )
              })}
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/50 py-20 text-center text-slate-500">
              Đang tải hoạt động...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-dashed border-red-200 bg-red-50 py-20 text-center text-red-500">
              Không thể tải danh sách hoạt động.
            </div>
          ) : paginatedActivities.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/50 py-20 text-center">
              <h3 className="text-lg font-black text-slate-950">
                Không có hoạt động phù hợp
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Thử đổi bộ lọc hoặc tìm kiếm từ khóa khác.
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === 'GRID'
                  ? 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3'
                  : 'space-y-5'
              }
            >
              {paginatedActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-slate-600 shadow-sm transition hover:bg-emerald-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black transition ${
                      page === item
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-600 shadow-sm hover:bg-emerald-100'
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-slate-600 shadow-sm transition hover:bg-emerald-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </section>
      </Container>

      <HomeFooter />
    </div>
  )
}

export default ActivityView