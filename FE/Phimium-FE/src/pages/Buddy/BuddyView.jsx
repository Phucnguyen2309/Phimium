// Hàm phụ trợ format tiền tệ VNĐ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

// Hàm phụ trợ format ngày giờ
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Hàm vẽ Ngôi Sao đánh giá
const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-1 text-amber-400 text-sm">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`w-4 h-4 ${star <= rating ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export const BuddyView = ({ hostedActivities, feedbacks, loading, handleCreateActivity }) => {
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* --- HEADER DASHBOARD --- */}
        <div className="relative overflow-hidden bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Background pattern */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 text-emerald-50 opacity-50">
            <svg width="300" height="300" fill="currentColor" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Khu vực của Buddy
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">
              Quản lý sự kiện
            </h1>
            <p className="text-slate-500 text-base md:text-lg max-w-xl">
              Nơi bạn biến ý tưởng thành những buổi gặp gỡ tuyệt vời. Theo dõi lịch trình và xem mọi người nói gì về bạn nhé!
            </p>
          </div>

          <button 
            onClick={handleCreateActivity}
            className="relative z-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-[0_8px_30px_rgb(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.5)] flex items-center gap-3 hover:-translate-y-1 group"
          >
            <span className="p-1.5 bg-white/20 rounded-lg group-hover:rotate-90 transition-transform duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            </span>
            Tạo sự kiện mới
          </button>
        </div>

        {/* --- GRID 2 CỘT --- */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI: DANH SÁCH HOẠT ĐỘNG (Chiếm 7 phần) */}
          <div className="xl:col-span-7 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-inner">🎯</span>
                Sự kiện của bạn
              </h2>
              <span className="text-sm font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                {hostedActivities?.length || 0} hoạt động
              </span>
            </div>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                // SKELETON LOADING
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 animate-pulse">
                    <div className="w-32 h-24 bg-slate-200 rounded-xl"></div>
                    <div className="flex-1 space-y-3 py-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : hostedActivities?.length > 0 ? (
                // MAP DATA THẬT
                hostedActivities.map((activity) => (
                  <div key={activity.id} className="group relative flex flex-col sm:flex-row gap-5 p-5 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300">
                    
                    {/* Hình thu nhỏ */}
                    <div className="w-full sm:w-40 h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                      {activity.thumbnailUrl ? (
                        <img src={activity.thumbnailUrl} alt={activity.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-emerald-50/50">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                      {/* Badge trạng thái */}
                      <span className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur text-xs font-bold rounded-md text-emerald-600 shadow-sm">
                        {activity.status === 'PUBLISHED' ? 'Đang mở' : activity.status}
                      </span>
                    </div>

                    {/* Thông tin */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                            {activity.title}
                          </h3>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md whitespace-nowrap">
                            {activity.activityType}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                          {activity.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {formatDate(activity.startTime)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <span className="truncate max-w-[150px]">{activity.locationName}</span>
                        </div>
                        <div className="ml-auto font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          {formatCurrency(activity.participationFee)}
                        </div>
                      </div>
                    </div>

                  </div>
                ))
              ) : (
                // EMPTY STATE
                <div className="flex flex-col items-center justify-center text-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                  <span className="text-6xl mb-4 grayscale opacity-40">⛺</span>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Chưa có hoạt động nào</h3>
                  <p className="text-slate-500 max-w-sm">
                    Bắt đầu hành trình kết nối mọi người bằng cách tạo sự kiện đầu tiên của bạn ngay hôm nay!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: ĐÁNH GIÁ (Chiếm 5 phần) */}
          <div className="xl:col-span-5 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="p-2.5 bg-amber-50 text-amber-500 rounded-xl shadow-inner">⭐</span>
              Đánh giá từ mem
            </h2>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {feedbacks?.length > 0 ? (
                 feedbacks.map((fb, idx) => (
                   <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
                      {/* Đánh giá Trip */}
                      <div className="mb-4 pb-4 border-b border-slate-200/60">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Về Hoạt Động</span>
                          <StarRating rating={fb.tripRating} />
                        </div>
                        <p className="text-sm text-slate-700 italic">"{fb.tripComment}"</p>
                      </div>
                      
                      {/* Đánh giá Buddy */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Về Buddy (Bạn)</span>
                          <StarRating rating={fb.buddyRating} />
                        </div>
                        <p className="text-sm text-slate-700 font-medium">"{fb.buddyComment}"</p>
                      </div>
                   </div>
                 ))
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl h-full">
                  <span className="text-5xl mb-4 opacity-40">💌</span>
                  <h3 className="text-slate-700 font-bold mb-1">Hộp thư trống</h3>
                  <p className="text-slate-500 text-sm px-4">
                    Các đánh giá chân thực từ người tham gia sẽ được tổng hợp tại đây sau khi sự kiện kết thúc.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      
      {/* Thêm CSS inline cho thanh cuộn đẹp hơn */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}} />
    </div>
  );
};