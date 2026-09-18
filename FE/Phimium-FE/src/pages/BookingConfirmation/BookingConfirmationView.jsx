import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ROUTES } from '@/routes/paths.js'
import activityService from '@/services/activityService.js'

export function BookingConfirmationView({ registrationId }) {
  const navigate = useNavigate()
  const [registration, setRegistration] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        // Fetch all user registrations and find the specific one
        const response = await activityService.getMyRegistrations()
        const regs = response?.data?.data || []
        const currentReg = regs.find(r => r.registrationId === registrationId)
        if (currentReg) {
          setRegistration(currentReg)
        }
      } catch (error) {
        console.error('Failed to fetch registration details', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRegistration()
  }, [registrationId])

  // Formatting date/time safely
  const formatDateTime = (dateString) => {
    if (!dateString) return { date: 'N/A', time: 'N/A' }
    try {
      const dateObj = new Date(dateString)
      return {
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    } catch {
      return { date: 'N/A', time: 'N/A' }
    }
  }

  const { date, time } = formatDateTime(registration?.departure?.startTime)
  const experienceTitle = registration?.departure?.activity?.title || 'Unknown Experience'
  const groupSize = (registration?.adultCount || 0) + (registration?.childCount || 0)
  const buddyName = registration?.buddy?.name || 'your guide'

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100/50 flex flex-col items-center justify-center pb-24">
        <p className="text-slate-500 text-sm font-medium animate-pulse">Loading confirmation...</p>
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-slate-100/50 flex flex-col items-center justify-center pb-24 px-4 text-center">
        <p className="text-slate-500 text-sm font-medium mb-4">Registration not found.</p>
        <Link to={ROUTES.home} className="text-blue-600 text-sm font-bold">Return to Home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100/50 font-sans pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <button className="p-2 -ml-2 text-[#0A196F] hover:bg-slate-50 rounded-full transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-lg font-black text-[#0A196F]">Phimium Saigon</h1>
          
          <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-200">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 pt-6 space-y-4">
        
        {/* Main Confirmation Card */}
        <div className="bg-gradient-to-b from-white to-yellow-50/50 rounded-[2rem] border border-yellow-100 p-6 shadow-sm text-center">
          
          <div className="mx-auto w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <svg className="w-8 h-8 text-yellow-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-[22px] font-black text-[#0A196F] leading-tight mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-[11px] font-medium text-slate-500 leading-relaxed px-4 mb-6">
            Your curated journey through Saigon is ready. We've sent the confirmation details to your email.
          </p>

          {/* Details Box */}
          <div className="bg-blue-50/50 rounded-2xl p-5 text-left border border-blue-100/50 mb-6">
            <div className="mb-4 pb-4 border-b border-blue-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">EXPERIENCE</p>
              <h3 className="text-[17px] font-black text-[#0A196F] leading-snug">{experienceTitle}</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date</p>
                <p className="text-[13px] font-bold text-slate-800">{date}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Time</p>
                <p className="text-[13px] font-bold text-slate-800">{time}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Group Size</p>
                <p className="text-[13px] font-bold text-slate-800">{groupSize} Guests</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link 
              to={ROUTES.userDashboard}
              className="flex w-full bg-yellow-400 text-yellow-950 font-black text-[13px] py-4 rounded-xl shadow-md shadow-yellow-400/20 active:scale-[0.98] transition items-center justify-center"
            >
              View My Booking
            </Link>
            <Link 
              to={ROUTES.home}
              className="flex w-full text-[#0A196F] font-bold text-[13px] py-3 rounded-xl active:scale-[0.98] transition items-center justify-center"
            >
              Return to Home
            </Link>
          </div>
        </div>

        {/* What's Next Card */}
        <div className="bg-[#0A196F] rounded-[1.5rem] p-6 shadow-sm text-white">
          <h3 className="text-base font-black mb-5 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            What's Next?
          </h3>
          
          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">1</div>
              <div>
                <h4 className="text-[13px] font-bold mb-1">Check Your Inbox</h4>
                <p className="text-[11px] text-blue-200 leading-snug">A detailed itinerary and PDF ticket have been sent to you.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">2</div>
              <div>
                <h4 className="text-[13px] font-bold mb-1">Guide Connection</h4>
                <p className="text-[11px] text-blue-200 leading-snug">Your guide, {buddyName}, will message you 24 hours before the tour starts.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">3</div>
              <div>
                <h4 className="text-[13px] font-bold mb-1">Meeting Point</h4>
                <p className="text-[11px] text-blue-200 leading-snug">Opera House Main Entrance. Look for the Phimium Yellow flag.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assistance Card */}
        <div className="bg-blue-100/50 rounded-[1.5rem] p-5 text-center border border-blue-200/50 shadow-sm">
          <div className="w-8 h-8 mx-auto bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h4 className="text-[13px] font-bold text-[#0A196F] mb-1">Need assistance?</h4>
          <p className="text-[11px] text-slate-500 mb-4">Our concierge is available 24/7</p>
          <button className="w-full py-2.5 rounded-xl border border-[#0A196F]/20 text-[#0A196F] text-[12px] font-bold hover:bg-[#0A196F]/5 transition">
            Contact Support
          </button>
        </div>

        {/* Map Placeholder */}
        <div className="rounded-[1.5rem] overflow-hidden shadow-sm relative h-40 border border-slate-200">
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=300&fit=crop" 
            alt="Map" 
            className="w-full h-full object-cover saturate-50 opacity-90"
          />
          <div className="absolute inset-0 bg-white/20"></div>
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-full py-2.5 px-4 flex items-center gap-2 shadow-sm border border-slate-100">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-[11px] font-bold text-slate-700 truncate">Meeting Point: Saigon Opera House</span>
          </div>
        </div>

      </main>

      {/* Bottom Nav (Mocked to match UI) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 z-40 max-w-md mx-auto">
        <button className="flex flex-col items-center justify-center w-16 text-slate-500 hover:text-[#0A196F]">
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center w-16 text-yellow-950 bg-yellow-400 rounded-xl py-1 px-2 h-12 shadow-sm">
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-[10px] font-black">Tours</span>
        </button>
        <button className="flex flex-col items-center justify-center w-16 text-slate-500 hover:text-[#0A196F]">
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="text-[10px] font-bold">Messages</span>
        </button>
        <button className="flex flex-col items-center justify-center w-16 text-slate-500 hover:text-[#0A196F]">
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>
    </div>
  )
}
