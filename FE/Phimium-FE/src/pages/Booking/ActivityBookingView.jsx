import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes/paths.js'
import { BookingForms } from './components/BookingForms.jsx'
import { OrderSummary } from './components/OrderSummary.jsx'
import activityService from '@/services/activityService.js'
import paymentService from '@/services/paymentService.js'
import { useAuth } from '@/hooks/useAuth.jsx'

export function ActivityBookingView({ activityId }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [date, setDate] = useState('')
  const [contactInfo, setContactInfo] = useState({
    email: user?.email || '',
    fullName: user?.fullName || user?.username || '',
    phone: user?.phoneNumber || ''
  })
  const [paymentMethod, setPaymentMethod] = useState('deposit') // 'deposit' | 'full'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [departureId, setDepartureId] = useState(null)

  useEffect(() => {
    const fetchDeparture = async () => {
      try {
        const res = await activityService.getAllActivities()
        const activities = res?.data?.data || []
        const currentActivity = activities.find(a => a.id === activityId)
        
        if (currentActivity && currentActivity.departures && currentActivity.departures.length > 0) {
          setDepartureId(currentActivity.departures[0].departureId)
        } else {
          // Mock UUID if no departure is found (backend might throw error, but we try)
          setDepartureId('00000000-0000-0000-0000-000000000000')
        }
      } catch (error) {
        console.error('Failed to fetch departures', error)
      }
    }
    fetchDeparture()
  }, [activityId])

  const handleClose = () => {
    navigate(-1)
  }

  const handleSubmit = async () => {
    if (!departureId) {
      alert('Loading availability... Please try again in a moment.')
      return
    }

    try {
      setIsSubmitting(true)

      // 1. Register Activity (Booking)
      const regPayload = {
        departureId: departureId,
        adultCount: 2,
        childCount: 0,
        isSafetyTermsAccepted: true
      }
      
      const regResponse = await activityService.registerActivity(regPayload)
      const registrationData = regResponse?.data?.data
      const newRegistrationId = registrationData?.registrationId

      if (!newRegistrationId) {
        throw new Error('No registration ID received')
      }

      // 2. Create Payment
      const paymentPayload = {
        paymentMethod: 'BANK_TRANSFER'
      }
      const payResponse = await paymentService.createPayment(newRegistrationId, paymentPayload)
      const paymentData = payResponse?.data?.data

      if (paymentData?.checkoutUrl) {
        // Redirect to Sepay/Bank checkout URL if provided
        window.location.href = paymentData.checkoutUrl
        return
      }

      // If no checkout URL, redirect to Booking Confirmation
      navigate(ROUTES.bookingConfirmation.replace(':registrationId', newRegistrationId), {
        replace: true
      })
    } catch (error) {
      console.error('Booking failed:', error)
      alert(error?.response?.data?.message || 'Failed to complete booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-32 lg:pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-50/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleClose}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#0A196F] hover:bg-slate-100 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-black text-[#0A196F]">Booking</h1>
            </div>
            
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">
          
          {/* Left Column (Forms) */}
          <div>
            <BookingForms 
              date={date} setDate={setDate}
              contactInfo={contactInfo} setContactInfo={setContactInfo}
              paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
            />
          </div>

          {/* Right Column (Order Summary) */}
          <div className="hidden lg:block">
            <OrderSummary 
              paymentMethod={paymentMethod}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
          
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-slate-600">Total Payment</div>
          <div className="text-xl font-black text-[#0A196F]">$175.00</div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center rounded-2xl bg-yellow-400 py-3.5 text-sm font-black text-yellow-950 shadow-md shadow-yellow-400/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing...' : 'Confirm'}
        </button>
      </div>
    </div>
  )
}
