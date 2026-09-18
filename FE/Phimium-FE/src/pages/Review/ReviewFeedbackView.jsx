import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes/paths.js'
import feedbackService from '@/services/feedbackService.js'

export function ReviewFeedbackView({ registrationId }) {
  const navigate = useNavigate()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    navigate(-1)
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating before submitting.')
      return
    }

    try {
      setIsSubmitting(true)

      const payload = {
        tourRating: rating,
        tourComment: comment,
        buddyRating: rating, // Mirroring rating since UI only has one "Overall rating"
        buddyComment: comment // Mirroring comment
      }

      await feedbackService.createFeedback(registrationId, payload)
      
      alert('Thank you for your feedback!')
      navigate(ROUTES.userDashboard, { replace: true })
    } catch (error) {
      console.error('Failed to submit review', error)
      alert(error?.response?.data?.message || 'Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100/50 font-sans pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={handleClose} className="p-2 -ml-2 text-[#0A196F] hover:bg-slate-50 rounded-full transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h1 className="text-lg font-black text-[#0A196F]">Phimium Saigon</h1>
          
          <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-200">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 pt-8 space-y-6">
        
        {/* Title Section */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <svg className="w-6 h-6 text-yellow-950" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-[#0A196F] leading-tight mb-3">
            How was your Saigon<br/>Experience?
          </h2>
          <p className="text-xs font-medium text-slate-500 leading-relaxed px-4">
            Your insights help us maintain the highest standards of luxury and local authenticity.
          </p>
        </div>

        {/* Review Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          
          {/* Rating */}
          <div className="text-center mb-6">
            <h3 className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase mb-3">
              Overall Rating
            </h3>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <svg 
                    className={`w-8 h-8 ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-slate-200'} transition-colors`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-700 mb-2">
              Describe your highlights or areas for improvement
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the guide, the local flavor, and the curation..."
              rows={4}
              className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-[#0A196F] focus:ring-2 focus:ring-[#0A196F]/10 outline-none resize-none transition"
            />
          </div>

          {/* Photo Upload (Mock UI) */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 mb-2">
              Share your memories (Optional)
            </h3>
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=160&h=160&fit=crop" alt="Memory" className="w-full h-full object-cover" />
              </div>
              <button className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:border-[#0A196F] hover:text-[#0A196F] transition bg-slate-50/50">
                <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[10px] font-bold">Upload</span>
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] font-medium text-slate-400 mb-4 italic">
            "Help us keep Phimium premium."
          </p>

          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-yellow-400 text-yellow-950 font-black text-sm py-3.5 rounded-xl shadow-md shadow-yellow-400/20 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
          </button>
        </div>

        {/* Banners */}
        <div className="space-y-3">
          {/* Points Banner */}
          <div className="bg-[#0A196F] rounded-xl p-4 flex items-center gap-4 text-white shadow-sm">
            <div className="bg-white/10 p-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold mb-0.5">Earn 500 Points</h4>
              <p className="text-[10px] text-blue-200 leading-tight">Credited to your Phimium account after submission.</p>
            </div>
          </div>

          {/* Support Banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="bg-white p-2 rounded-lg text-blue-800 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0A196F] mb-0.5">Direct Support?</h4>
              <p className="text-[10px] text-blue-600 leading-tight">Immediate concerns? Chat with our team.</p>
            </div>
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
        <button className="flex flex-col items-center justify-center w-16 text-slate-500 hover:text-[#0A196F]">
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-[10px] font-bold">Tours</span>
        </button>
        <button className="flex flex-col items-center justify-center w-16 text-slate-500 hover:text-[#0A196F]">
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="text-[10px] font-bold">Messages</span>
        </button>
        <button className="flex flex-col items-center justify-center w-16 text-yellow-950 bg-yellow-400 rounded-xl py-1 px-2 h-12 shadow-sm">
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-black">Profile</span>
        </button>
      </nav>
    </div>
  )
}
