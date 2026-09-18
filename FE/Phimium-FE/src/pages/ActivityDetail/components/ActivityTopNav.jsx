import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, HeartIcon } from './ActivityDetailIcons.jsx'

export function ActivityTopNav({ title }) {
  const navigate = useNavigate()
  
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between bg-white/90 backdrop-blur px-4 py-3 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-slate-800" />
        </button>
        <span className="font-bold text-blue-950 text-base">{title || "Phimium Saigon"}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-1 text-blue-950 hover:text-blue-800 transition-colors">
          <HeartIcon className="h-5 w-5" />
        </button>
        <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-200">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  )
}
