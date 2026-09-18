export function SpecificFocus({ focusTags, setFocusTags, dietaryPref, setDietaryPref }) {
  const deepDives = [
    'Pre-1975 History',
    'Architecture',
    'Chợ Lớn (Chinatown)',
    'Art Galleries'
  ]

  const toggleTag = (tag) => {
    if (focusTags.includes(tag)) {
      setFocusTags(focusTags.filter(t => t !== tag))
    } else {
      setFocusTags([...focusTags, tag])
    }
  }

  return (
    <section className="mb-12">
      <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 mb-6">
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-900 text-sm">2</span> 
        Specific Focus
      </h2>
      
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="mb-8">
          <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-4">
            Deep Dive Selections
          </label>
          <div className="flex flex-wrap gap-3">
            {deepDives.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  focusTags.includes(tag)
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-slate-100 mb-8"></div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-4">
            Dietary Preferences
          </label>
          <textarea
            value={dietaryPref}
            onChange={(e) => setDietaryPref(e.target.value)}
            placeholder="e.g. Vegetarian, No shellfish, Halal..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 min-h-[120px] resize-none transition-all duration-200"
          ></textarea>
        </div>
      </div>
    </section>
  )
}
