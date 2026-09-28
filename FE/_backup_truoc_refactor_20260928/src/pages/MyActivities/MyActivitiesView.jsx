import { ACTIVITY_TABS } from './constants.js'
import { useMyActivities } from './useMyActivities.js'
import MyActivityCard from './components/MyActivityCard.jsx'


export default function MyActivitiesView() {
  const {
    filteredActivities = [],
    activeTab = 'ALL',
    setActiveTab,
    loading = false,
    error = null,
  } = useMyActivities()

  const activityList = Array.isArray(filteredActivities)
    ? filteredActivities
    : []

  if (loading) {
    return (
      <section className="w-full">
        <h1 className="text-2xl font-bold text-slate-900">Hoạt động của tôi</h1>
        <p className="mt-4 text-sm text-slate-500">Đang tải hoạt động...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="w-full">
        <h1 className="text-2xl font-bold text-slate-900">Hoạt động của tôi</h1>
        <p className="mt-4 text-sm text-red-500">
          Không thể tải hoạt động. Vui lòng thử lại.
        </p>
      </section>
    )
  }

  return (
    <section className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Hoạt động của tôi</h1>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý các hoạt động bạn đã tham gia.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {ACTIVITY_TABS.map((tab) => {
          const isActive = activeTab === tab.value

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activityList.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Chưa có hoạt động nào
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Không có hoạt động nào trong tab này.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activityList.map((activity) => (
            <MyActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </section>
  )
}
