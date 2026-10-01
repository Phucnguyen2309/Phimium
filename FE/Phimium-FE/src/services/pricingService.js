import http from '@/services/http.js'

const pricingService = {
  /**
   * Báo giá trước khi đặt (cần đăng nhập).
   * payload: { departureId, adultCount, childCount, couponCode? }
   * -> { unitPrice, adultSubtotal, childSubtotal, subtotal, discountAmount, isCouponApplied, couponMessage, totalAmount }
   */
  getQuote: (payload) => http.post('/v1/pricing/quote', payload),
}

export default pricingService
