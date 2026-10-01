import http from '@/services/http.js'

const paymentService = {
  /** Lịch sử thanh toán của tôi (Spring Page<PaymentResponse>, mới nhất trước) */
  getMyPayments: () => http.get('/payment/me', { params: { size: 20 } }),

  /** Chi tiết một lần thanh toán của tôi (PaymentResponse) */
  getPayment: (paymentId) => http.get(`/payment/${paymentId}`),

  /** Tạo thanh toán SePay cho một đăng ký -> { checkoutUrl, fields } để POST form sang cổng thanh toán */
  createPayment: (registrationId, paymentMethod = 'BANK_TRANSFER') =>
    http.post(`/payment/registration/${registrationId}`, { paymentMethod }),
}

export default paymentService
