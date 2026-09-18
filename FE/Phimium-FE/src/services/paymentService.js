import http from '@/services/http.js'

const paymentService = {
  createPayment: (registrationId, payload) => http.post(`/payment/registration/${registrationId}`, payload),

  getMyPayments: (params) => http.get('/payment/me', { params }),

  getPaymentHistory: (paymentId) => http.get(`/payment/${paymentId}`),
}

export default paymentService
