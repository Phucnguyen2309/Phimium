import { useState } from 'react'

import MyActivitiesView from '@/pages/MyActivities/MyActivitiesView.jsx'
import { HomeFooter } from '@/pages/Home/components/HomeFooter.jsx'

const DASHBOARD_TABS = [
  { label: 'Hoạt động', value: 'ACTIVITIES' },
  { label: 'Đăng ký', value: 'REGISTRATIONS' },
  { label: 'Nhóm', value: 'GROUPS' },
  { label: 'Phản hồi', value: 'FEEDBACK' },
]

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('ACTIVITIES')

  return (
    <div className="flex min-h-[calc(100vh-128px)] flex-col bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-6 py-8">
        <aside className="w-56 shrink-0 rounded-2xl bg-white p-4 shadow-sm">
          <nav className="space-y-2">
            {DASHBOARD_TABS.map((tab) => {
              const isActive = activeTab === tab.value

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 rounded-2xl bg-white p-6 shadow-sm">
          {activeTab === 'ACTIVITIES' && <MyActivitiesView />}

          {activeTab === 'REGISTRATIONS' && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Đăng ký
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Nội dung đăng ký sẽ hiển thị tại đây.
              </p>
            </div>
          )}

          {activeTab === 'GROUPS' && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Nhóm</h2>
              <p className="mt-2 text-sm text-slate-500">
                Nội dung nhóm sẽ hiển thị tại đây.
              </p>
            </div>
          )}

          {activeTab === 'FEEDBACK' && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Phản hồi
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Nội dung phản hồi sẽ hiển thị tại đây.
              </p>
            </div>
          )}
        </main>
      </div>

      <div className="mt-auto">
        <HomeFooter />
      </div>
    </div>
  )
}
