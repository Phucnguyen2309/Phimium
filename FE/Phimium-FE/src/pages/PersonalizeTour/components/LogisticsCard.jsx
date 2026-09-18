export function LogisticsCard({
  groupSize,
  setGroupSize,
  date,
  setDate,
  time,
  setTime,
  onSaveDraft,
  onContinue
}) {
  return (
    <div className="sticky top-24">
      <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 mb-6">
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-900 text-sm">3</span> 
        Logistics
      </h2>
      
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {/* Glow effect at top */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 via-blue-400 to-yellow-400"></div>
        
        <div className="p-6 sm:p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-3">
                Group Size
              </label>
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-blue-50/50 p-2">
                <button
                  type="button"
                  onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-slate-600 hover:text-blue-600 hover:shadow transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </button>
                
                <span className="text-lg font-black text-slate-900 w-12 text-center">{groupSize}</span>
                
                <button
                  type="button"
                  onClick={() => setGroupSize(groupSize + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-slate-600 hover:text-blue-600 hover:shadow transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-3">
                Preferred Date & Start Time
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-10 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                  >
                    <option value="Morning (8:00 AM)">Morning (8:00 AM)</option>
                    <option value="Afternoon (2:00 PM)">Afternoon (2:00 PM)</option>
                    <option value="Evening (6:00 PM)">Evening (6:00 PM)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-6 sm:p-8 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Phimium Concierge" className="h-10 w-10 rounded-full border-2 border-white shadow-sm" />
            <div>
              <p className="text-sm font-black text-slate-900 leading-none">Curated by Phimium</p>
              <p className="text-xs text-slate-500 mt-1">Our concierge will review this flow.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onSaveDraft}
              className="rounded-2xl border border-blue-200 bg-white py-3.5 text-sm font-bold text-blue-900 shadow-sm transition hover:bg-blue-50 hover:border-blue-300 active:scale-[0.98]"
            >
              Save Draft
            </button>
            <button
              onClick={onContinue}
              className="flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 py-3.5 text-sm font-black text-yellow-950 shadow-md shadow-yellow-400/20 transition hover:bg-yellow-500 active:scale-[0.98]"
            >
              Continue
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
