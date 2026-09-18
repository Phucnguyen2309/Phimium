import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes/paths.js'
import { CoreThemes } from './components/CoreThemes.jsx'
import { SpecificFocus } from './components/SpecificFocus.jsx'
import { LogisticsCard } from './components/LogisticsCard.jsx'

export function PersonalizeTourView({ activityId }) {
  const navigate = useNavigate()
  
  const [selectedTheme, setSelectedTheme] = useState('combination')
  const [focusTags, setFocusTags] = useState(['Architecture', 'Art Galleries'])
  const [dietaryPref, setDietaryPref] = useState('')
  const [groupSize, setGroupSize] = useState(2)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('Morning (8:00 AM)')

  const handleClose = () => {
    navigate(-1) // Go back
  }

  const handleSaveDraft = () => {
    alert('Draft saved! You can continue later.')
  }

  const handleContinue = () => {
    navigate(ROUTES.activityBooking.replace(':id', activityId || '1'))
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={handleClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <div className="h-1 w-8 rounded-full bg-yellow-400"></div>
                <div className="h-1 w-8 rounded-full bg-slate-200"></div>
                <div className="h-1 w-8 rounded-full bg-slate-200"></div>
              </div>
              <span className="text-xs font-bold text-slate-900 tracking-wide">
                Step 1 of 3: Curating Your Interest
              </span>
            </div>
            
            <button 
              onClick={handleClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-blue-950 tracking-tight">
          Design Your Own Experience
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
          Tell us what fuels your curiosity, and we'll craft a bespoke journey through the hidden pulse of Saigon.
        </p>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
          
          {/* Left Column */}
          <div>
            <CoreThemes 
              selectedTheme={selectedTheme} 
              onSelectTheme={setSelectedTheme} 
            />
            
            <SpecificFocus 
              focusTags={focusTags}
              setFocusTags={setFocusTags}
              dietaryPref={dietaryPref}
              setDietaryPref={setDietaryPref}
            />
          </div>

          {/* Right Column (Sticky) */}
          <div className="lg:sticky lg:top-24">
            <LogisticsCard 
              groupSize={groupSize}
              setGroupSize={setGroupSize}
              date={date}
              setDate={setDate}
              time={time}
              setTime={setTime}
              onSaveDraft={handleSaveDraft}
              onContinue={handleContinue}
            />
          </div>
          
        </div>
      </div>
    </div>
  )
}
