import http from '@/services/http.js'

const registrationService = {
  /**
   * Đặt tour (giữ chỗ, chờ thanh toán).
   * payload: { departureId, adultCount (≥1), childCount (≥0), isSafetyTermsAccepted: true, pickupLocation (≤500), couponCode? }
   */
  create: (payload) => http.post('/v1/registrations', payload),

  /** Các tour tôi đã đăng ký (RegistrationResponse[]) */
  getMyRegistrations: () => http.get('/v1/registrations/me'),

  /** Check-in: mở 60 phút trước giờ khởi hành, đóng khi tour kết thúc */
  checkIn: (registrationId) => http.post(`/v1/registrations/${registrationId}/check-in`),

  /** Huỷ đăng ký (chỉ trước giờ khởi hành và chưa thanh toán) */
  cancel: (registrationId) => http.post(`/v1/registrations/${registrationId}/cancel`),
}

export default registrationService
