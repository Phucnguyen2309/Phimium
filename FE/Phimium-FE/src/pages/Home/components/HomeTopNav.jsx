import { MenuIcon } from './HomeIcons.jsx'

export function HomeTopNav() {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between bg-white/90 backdrop-blur px-6 py-4">
      <div className="flex items-center gap-4">
        <button className="text-slate-800">
          <MenuIcon />
        </button>
        <span className="font-bold text-blue-950 text-lg">Phimium Saigon</span>
      </div>
      
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-200 shadow-sm">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  )
}
