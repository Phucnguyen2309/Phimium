export function ChatWindow() {
  return (
    <div className="flex flex-col h-full bg-[#F8F9FB]">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src="https://i.pravatar.cc/150?u=minh" 
              alt="Minh Nguyen" 
              className="w-10 h-10 rounded-full object-cover border border-slate-100"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-none">Minh Nguyen</h3>
            <p className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online now
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-slate-400">
          <button className="p-2 hover:bg-slate-100 rounded-full transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-full transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-center">
          <span className="px-3 py-1 bg-blue-100/50 text-blue-800 text-[11px] font-bold rounded-full">
            Today
          </span>
        </div>

        {/* Message 1 (Guide) */}
        <div className="flex flex-col items-start gap-1">
          <div className="bg-white border border-slate-100 text-slate-700 text-sm p-4 rounded-2xl rounded-tl-sm max-w-[85%] sm:max-w-[75%] shadow-sm leading-relaxed">
            Xin chào! I'm Minh, your guide for the "Saigon Twilight Food Trail" tonight. I'm currently finalizing our route to include a hidden rooftop gem that just opened!
          </div>
          <span className="text-[10px] text-slate-400 font-medium ml-1">14:02</span>
        </div>

        {/* Message 2 (User) */}
        <div className="flex flex-col items-end gap-1">
          <div className="bg-[#0A196F] text-white text-sm p-4 rounded-2xl rounded-tr-sm max-w-[85%] sm:max-w-[75%] shadow-md leading-relaxed">
            That sounds amazing, Minh! We're really looking forward to it. Is there a specific dress code for the rooftop?
          </div>
          <span className="text-[10px] text-slate-400 font-medium mr-1">14:15</span>
        </div>

        {/* Message 3 (Guide) */}
        <div className="flex flex-col items-start gap-1">
          <div className="bg-white border border-slate-100 text-slate-700 text-sm p-4 rounded-2xl rounded-tl-sm max-w-[85%] sm:max-w-[75%] shadow-sm leading-relaxed">
            Smart casual is perfect. Comfortable shoes are a must as we'll be exploring some narrow alleys between stops. See you at the meeting point!
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        {/* Quick Replies */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
          <button className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-100 transition">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Meeting point?
          </button>
          <button className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-100 transition">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Dietary update
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Message Minh..." 
              className="w-full bg-white border border-slate-200 rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
          </div>
          <button className="flex-shrink-0 w-11 h-11 bg-[#0A196F] text-white rounded-full flex items-center justify-center hover:bg-blue-900 transition-colors shadow-md">
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
