import http from '@/services/http.js'

const buddyService = {
  /** Lịch dẫn tour được phân công cho Buddy */
  getMySchedules: () => http.get('/buddies/me/schedules'),

  /** Danh sách thành viên trong ca tour */
  getTourMembers: (departureId) =>
    http.get(`/buddies/me/schedules/${departureId}/members`),

  /** Điểm danh / Đã đón khách trong ca tour */
  checkInMember: (departureId, registrationId) =>
    http.post(`/buddies/me/schedules/${departureId}/members/${registrationId}/check-in`),

  /** Bật/Tắt trạng thái nhận tour (ACTIVE / INACTIVE) */
  updateMyStatus: (status) =>
    http.patch('/buddies/me/status', null, { params: { status } }),

  /** Lấy đánh giá từ khách hàng dành cho Buddy */
  getFeedbackByBuddy: (buddyId) => http.get(`/feedback/buddies/${buddyId}`),

  /** Đăng ký nâng cấp lên Buddy */
  upgradeToBuddy: (payload) => http.patch('/buddies/upgrade', payload),

  /** Hoạt động do Buddy phụ trách (nếu có) */
  getHostedActivities: (buddyId) =>
    http.get('/buddies/getActivityByBuddy', { params: { buddy: buddyId } }),
}

export default buddyService
