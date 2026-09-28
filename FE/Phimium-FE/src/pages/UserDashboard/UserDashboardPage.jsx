import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import { SiteFooter } from '@/components/layout/SiteFooter.jsx'
import { MyActivitiesPanel } from '@/features/myActivities/MyActivitiesPanel.jsx'
import { MyGroupsPanel } from '@/features/myGroups/MyGroupsPanel.jsx'
import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

const DASHBOARD_TABS = [
  { labelKey: 'dashboard.tabs.activities', value: 'ACTIVITIES' },
  { labelKey: 'dashboard.tabs.groups', value: 'GROUPS' },
  { labelKey: 'dashboard.tabs.feedback', value: 'FEEDBACK' },
]

const isValidTab = (value) => DASHBOARD_TABS.some((tab) => tab.value === value)

const UserDashboardPage = () => {
  const { t } = useLanguage()

  useDocumentTitle(t('dashboard.pageTitle'))

  const location = useLocation()
  const initialTab = location.state?.activeTab
  const successMessageKey = location.state?.messageKey

  const [activeTab, setActiveTab] = useState(
    isValidTab(initialTab) ? initialTab : 'ACTIVITIES',
  )

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
                  {t(tab.labelKey)}
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 rounded-2xl bg-white p-6 shadow-sm">
          {successMessageKey && (
            <p className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {t(successMessageKey)}
            </p>
          )}

          {activeTab === 'ACTIVITIES' && <MyActivitiesPanel />}

          {activeTab === 'GROUPS' && <MyGroupsPanel />}

          {activeTab === 'FEEDBACK' && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {t('dashboard.tabs.feedback')}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {t('dashboard.feedbackEmpty')}
              </p>
            </div>
          )}
        </main>
      </div>

      <div className="mt-auto">
        <SiteFooter />
      </div>
    </div>
  )
}

export default UserDashboardPage
