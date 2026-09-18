export function BookingForms({
  date, setDate,
  contactInfo, setContactInfo,
  paymentMethod, setPaymentMethod
}) {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  // A mock calendar grid for visual similarity with the design
  const dates = [
    { num: 28, inactive: true }, { num: 29, inactive: true }, { num: 30, inactive: true },
    { num: 1 }, { num: 2 }, { num: 3 }, { num: 4 },
    { num: 5 }, { num: 6, selected: true }, { num: 7 }, { num: 8 }, { num: 9 }, { num: 10 }, { num: 11 },
    { num: 12 }
  ]

  const handleChangeContact = (e) => {
    setContactInfo({ ...contactInfo, [e.target.name]: e.target.value })
  }

  return (
    <div className="space-y-6">
      {/* 1. Select Travel Date */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 mb-6">
          <svg className="w-5 h-5 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Select Travel Date
        </h3>

        <div className="max-w-xs mb-4">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {days.map(d => (
              <div key={d} className="text-xs font-bold text-slate-400">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {dates.map((d, i) => (
              <button 
                key={i}
                disabled={d.inactive}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                  d.inactive ? 'text-slate-300' : 
                  d.selected ? 'bg-[#0A196F] text-white shadow-md' : 
                  'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {d.num}
              </button>
            ))}
          </div>
        </div>

        <p className="flex items-start gap-1.5 text-xs text-slate-500 font-medium">
          <svg className="w-4 h-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tours are private and customizable for your selected date.
        </p>
      </div>

      {/* 2. Contact Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 mb-6">
          <svg className="w-5 h-5 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Contact Information
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Address</label>
            <input 
              type="email"
              name="email"
              value={contactInfo.email}
              onChange={handleChangeContact}
              placeholder="e.g. james.travels@gmail.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-xs text-slate-500 mt-1.5 font-medium">We'll send your curated itinerary and confirmation here.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Full Name</label>
            <input 
              type="text"
              name="fullName"
              value={contactInfo.fullName}
              onChange={handleChangeContact}
              placeholder="James Wilson"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Phone Number (Optional)</label>
            <input 
              type="tel"
              name="phone"
              value={contactInfo.phone}
              onChange={handleChangeContact}
              placeholder="+1 (555) 000-0000"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* 3. Payment Method */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 mb-6">
          <svg className="w-5 h-5 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Payment Method
        </h3>

        <div className="space-y-3">
          <label 
            className={`block relative rounded-2xl border-2 p-4 cursor-pointer transition-all ${
              paymentMethod === 'deposit' ? 'border-[#0A196F] bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center h-5 mt-0.5">
                <input 
                  type="radio" 
                  name="payment" 
                  value="deposit"
                  checked={paymentMethod === 'deposit'}
                  onChange={() => setPaymentMethod('deposit')}
                  className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-blue-900" 
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Pay 20% Deposit Only</span>
                  <span className="inline-flex px-2 py-0.5 bg-yellow-400 text-yellow-950 text-xs font-black rounded-full">$35.00</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Secure your spot. Pay the remaining balance on arrival.</p>
              </div>
            </div>
          </label>

          <label 
            className={`block relative rounded-2xl border-2 p-4 cursor-pointer transition-all ${
              paymentMethod === 'full' ? 'border-[#0A196F] bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center h-5 mt-0.5">
                <input 
                  type="radio" 
                  name="payment" 
                  value="full"
                  checked={paymentMethod === 'full'}
                  onChange={() => setPaymentMethod('full')}
                  className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-blue-900" 
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Full Pre-payment</span>
                  <span className="text-sm font-black text-slate-600">$175.00</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">One-click checkout for an effortless experience.</p>
              </div>
            </div>
          </label>
        </div>

        {/* Encrypted Badge */}
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <p className="text-xs font-bold text-slate-700 leading-tight">Encrypted</p>
            <p className="text-xs font-bold text-slate-700 leading-tight">Transaction</p>
          </div>
          <div className="ml-auto flex gap-1">
            <div className="w-6 h-4 bg-slate-200 rounded-sm"></div>
            <div className="w-6 h-4 bg-slate-200 rounded-sm"></div>
            <div className="w-6 h-4 bg-slate-200 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
