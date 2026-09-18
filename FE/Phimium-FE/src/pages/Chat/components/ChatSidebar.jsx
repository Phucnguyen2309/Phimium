import { Link } from 'react-router-dom'

export function ChatSidebar() {
  return (
    <div className="w-full h-full bg-white border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">Messages</h2>
        <Link to="/user-dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Back
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 bg-blue-50/50 cursor-pointer border-l-4 border-blue-600 transition-colors">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="https://i.pravatar.cc/150?u=minh" 
                alt="Minh Nguyen" 
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900 truncate">Minh Nguyen</p>
                <p className="text-xs font-semibold text-blue-600">14:15</p>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">Smart casual is perfect. Comfortable sh...</p>
            </div>
          </div>
        </div>

        {/* Mock other chats */}
        <div className="p-3 hover:bg-slate-50 cursor-pointer border-l-4 border-transparent transition-colors opacity-60">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="https://i.pravatar.cc/150?u=phimium" 
                alt="Support" 
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900 truncate">Phimium Support</p>
                <p className="text-xs font-medium text-slate-400">Yesterday</p>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">Welcome to Phimium! Let us know if...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
