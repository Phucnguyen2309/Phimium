export function CoreThemes({ selectedTheme, onSelectTheme }) {
  const themes = [
    {
      id: 'food',
      title: 'Food',
      subtitle: 'Culinary & Street Life',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80',
    },
    {
      id: 'history',
      title: 'History',
      subtitle: 'Heritage & Archives',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80',
    },
    {
      id: 'combination',
      title: 'Combination',
      subtitle: 'The Best of Both Worlds',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80',
    }
  ]

  return (
    <section className="mb-12">
      <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 mb-6">
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-900 text-sm">1</span> 
        Select Your Core Themes
      </h2>
      
      <div className="grid gap-4 sm:grid-cols-3">
        {themes.map((theme) => {
          const isSelected = selectedTheme === theme.id
          
          return (
            <div 
              key={theme.id} 
              onClick={() => onSelectTheme(theme.id)}
              className={`group relative h-48 sm:h-64 overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${isSelected ? 'ring-4 ring-blue-600 ring-offset-2 shadow-xl' : 'shadow-sm hover:shadow-lg'}`}
            >
              <img src={theme.image} alt={theme.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent"></div>
              
              <div className="absolute bottom-4 left-5 right-4">
                <h3 className="text-xl font-black text-white">{theme.title}</h3>
                <p className="text-xs text-slate-300 mt-1 font-medium">{theme.subtitle}</p>
              </div>
              
              {theme.id === 'combination' && (
                <span className="absolute top-3 right-3 rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-black tracking-wide text-yellow-950 shadow-sm">
                  RECOMMENDED
                </span>
              )}

              {isSelected && (
                <div className="absolute top-3 left-3 bg-blue-600 text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
