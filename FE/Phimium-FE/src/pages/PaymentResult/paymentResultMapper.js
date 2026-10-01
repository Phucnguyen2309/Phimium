import { getResponseData } from '@/utils/response.js'
import { getValidText } from '@/utils/text.js'

/** Trạng thái hiển thị của trang kết quả thanh toán */
export const RESULT_STATE = {
  paid: 'PAID',
  verifying: 'VERIFYING',
  review: 'REVIEW',
  failed: 'FAILED',
  cancelled: 'CANCELLED',
  unknown: 'UNKNOWN',
}

export const mapPaymentDetail = (response) => {
  const payment = getResponseData(response) ?? {}

  return {
    id: payment.id ?? '',
    registrationId: payment.registrationId ?? '',
    invoiceNumber: getValidText(payment.invoiceNumber),
    amount: Number(payment.amount) || 0,
    status: String(payment.status ?? 'PENDING').toUpperCase(),
    paymentMethod: payment.paymentMethod ?? '',
    providerTransactionId: getValidText(payment.providerTransactionId),
    createdAt: payment.createdAt ?? null,
    paidAt: payment.paidAt ?? null,
  }
}

/**
 * Ghép kết quả SePay chuyển về (success / error / cancel) với trạng thái thật trong DB.
 * DB là nguồn đúng: SePay báo success nhưng IPN chưa tới thì vẫn là "đang xác nhận".
 */
export const getResultState = (result, payment) => {
  if (!payment) return result === 'cancel' ? RESULT_STATE.cancelled : RESULT_STATE.unknown

  switch (payment.status) {
    case 'PAID':
      return RESULT_STATE.paid
    case 'REVIEW_REQUIRED':
      return RESULT_STATE.review
    case 'FAILED':
    case 'EXPIRED':
      return RESULT_STATE.failed
    default:
      // PENDING
      if (result === 'success') return RESULT_STATE.verifying
      if (result === 'cancel') return RESULT_STATE.cancelled
      return RESULT_STATE.failed
  }
}

/** Còn thanh toán lại được (chưa trả và chưa hết hạn giữ chỗ; Backend kiểm tra lại lần nữa) */
export const canRetryPayment = (state, payment) =>
  Boolean(payment?.registrationId) &&
  ['PENDING', 'FAILED'].includes(payment.status) &&
  [RESULT_STATE.failed, RESULT_STATE.cancelled].includes(state)
