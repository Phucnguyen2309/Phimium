export function ChatTourInfo() {
  const handleCheckIn = () => {
    alert('Check-in successful! Enjoy your tour.')
  }

  return (
    <div className="w-full h-full bg-white border-l border-slate-200 p-6 overflow-y-auto">
      <h3 className="text-lg font-black text-slate-900 mb-6">Tour Context</h3>
      
      {/* Tour Info Card */}
      <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
        <img 
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80" 
          alt="Saigon Food Trail" 
          className="w-full h-32 object-cover rounded-xl mb-4"
        />
        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-full">
          Food Tour
        </span>
        <h4 className="font-bold text-slate-900 mt-2">Saigon Twilight Food Trail</h4>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
          Discover hidden gems and authentic culinary experiences in the heart of the city.
        </p>
      </div>

      {/* Sticky Action Box (moved from bottom of chat to here for desktop) */}
      <div className="rounded-2xl border-2 border-yellow-300 bg-yellow-100 p-5 shadow-sm text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-yellow-200 rounded-full opacity-50 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-12 h-12 bg-yellow-200 rounded-full opacity-50 blur-lg"></div>
        
        <div className="relative z-10">
          <h4 className="text-sm font-black text-yellow-900">Tour starts in 45 minutes</h4>
          <p className="text-xs text-yellow-800 mt-1">Ready to start your curated journey?</p>
          
          <button 
            onClick={handleCheckIn}
            className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black text-sm py-3 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            Check-in for Tour
          </button>
        </div>
      </div>
    </div>
  )
}
