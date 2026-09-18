export function OrderSummary({ paymentMethod, onSubmit, isSubmitting }) {
  return (
    <div className="sticky top-24 space-y-6">
      {/* 1. Summary Card */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Image & Badge */}
        <div className="relative h-48">
          <img 
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80" 
            alt="Secret Flavors of District 1" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-[#0A196F] text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-md">
            Highly Rated
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-black text-[#0A196F] leading-tight mb-2">
            Secret Flavors of District 1
          </h2>
          
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-6">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              4 Hours
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m0-4a4 4 0 100-8 4 4 0 000 8zm8 0a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
              Private Group
            </span>
          </div>

          <div className="border-t border-slate-100 py-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-600">Base Rate (2 Guests)</span>
              <span className="font-black text-slate-800">$150.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-600">Premium Spirits Upgrade</span>
              <span className="font-black text-slate-800">$25.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-600">Booking Fee</span>
              <span className="font-black text-[#0A196F]">FREE</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 pb-6 flex justify-between items-end">
            <span className="text-sm font-semibold text-slate-600">Total Due</span>
            <div className="text-right">
              <div className="text-xl font-black text-[#0A196F] line-through opacity-50 text-sm mb-0.5">$175.00</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">VAT Included</div>
            </div>
          </div>

          <button 
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 py-4 text-sm font-black text-yellow-950 shadow-md shadow-yellow-400/20 transition hover:bg-yellow-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Confirm & Pay Securely'}
            {!isSubmitting && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>

          <p className="mt-4 text-[10px] text-center font-medium text-slate-500 max-w-[250px] mx-auto leading-relaxed">
            By clicking "Confirm", you agree to Phimium's <a href="#" className="underline decoration-slate-300 underline-offset-2">Terms of Service</a> and <a href="#" className="underline decoration-slate-300 underline-offset-2">Cancellation</a> Policy.
          </p>
        </div>
      </div>

      {/* 2. Verified Curator Badge */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
        <div className="flex-shrink-0 w-10 h-10 bg-[#0A196F] text-white rounded-full flex items-center justify-center shadow-md">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h4 className="text-xs font-black text-[#0A196F] mb-0.5">Verified Curator</h4>
          <p className="text-[11px] font-medium text-slate-500 leading-tight">
            This tour is curated by local historians and gastronomy experts.
          </p>
        </div>
      </div>
    </div>
  )
}
