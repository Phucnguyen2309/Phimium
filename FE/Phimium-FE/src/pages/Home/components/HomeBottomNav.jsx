import { HomeIcon, CompassIcon, MessageIcon, UserIcon } from './HomeIcons.jsx'

export function HomeBottomNav() {
  const tabs = [
    { id: 'home', label: 'Home', icon: <HomeIcon className="h-5 w-5 mb-1" />, active: true },
    { id: 'tours', label: 'Tours', icon: <CompassIcon className="h-5 w-5 mb-1" />, active: false },
    { id: 'messages', label: 'Messages', icon: <MessageIcon className="h-5 w-5 mb-1" />, active: false },
    { id: 'profile', label: 'Profile', icon: <UserIcon className="h-5 w-5 mb-1" />, active: false },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200">
      <div className="mx-auto max-w-md flex justify-between px-6 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-colors ${
              tab.active ? 'text-yellow-950 bg-yellow-400' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            <span className={`text-[10px] ${tab.active ? 'font-bold' : 'font-medium'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
