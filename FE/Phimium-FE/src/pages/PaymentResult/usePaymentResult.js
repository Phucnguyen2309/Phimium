import { useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'
import { PAYMENT_RESULTS } from '@/routes/paths.js'
import paymentService from '@/services/paymentService.js'
import { submitCheckoutForm } from '@/utils/checkout.js'
import { getErrorMessage, getResponseData } from '@/utils/response.js'

import { canRetryPayment, getResultState, mapPaymentDetail, RESULT_STATE } from './paymentResultMapper.js'

// IPN của SePay có thể tới chậm vài giây sau khi khách được chuyển về
const POLL_INTERVAL = 3000
const MAX_POLLS = 10

export function usePaymentResult() {
  const { result: rawResult } = useParams()
  const [searchParams] = useSearchParams()
  const { t } = useLanguage()

  const result = Object.values(PAYMENT_RESULTS).includes(rawResult) ? rawResult : PAYMENT_RESULTS.error
  const paymentId = searchParams.get('paymentId') ?? ''

  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(Boolean(paymentId))
  const [polls, setPolls] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const [retrying, setRetrying] = useState(false)
  const [retryError, setRetryError] = useState('')

  const state = loading ? null : getResultState(result, payment)

  useDocumentTitle(t(`paymentResult.pageTitle.${result}`))

  useEffect(() => {
    if (!paymentId) return undefined

    let isMounted = true

    paymentService
      .getPayment(paymentId)
      .then((response) => {
        if (isMounted) setPayment(mapPaymentDetail(response))
      })
      .catch(() => {
        if (isMounted) setPayment(null)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [paymentId, polls, reloadKey])

  // Đang chờ IPN: hỏi lại trạng thái vài lần
  useEffect(() => {
    if (state !== RESULT_STATE.verifying || polls >= MAX_POLLS) return undefined

    const timer = setTimeout(() => setPolls((current) => current + 1), POLL_INTERVAL)

    return () => clearTimeout(timer)
  }, [state, polls])

  const checkAgain = useCallback(() => {
    setLoading(true)
    setPolls(0)
    setReloadKey((current) => current + 1)
  }, [])

  const retryPayment = async () => {
    if (!payment?.registrationId) return

    setRetrying(true)
    setRetryError('')

    try {
      const checkout = getResponseData(await paymentService.createPayment(payment.registrationId))

      if (!checkout?.checkoutUrl) throw new Error('missing checkoutUrl')

      submitCheckoutForm(checkout)
    } catch (err) {
      setRetryError(getErrorMessage(err, t('paymentResult.retryFailed')))
      setRetrying(false)
    }
  }

  return {
    canRetry: canRetryPayment(state, payment),
    checkAgain,
    gaveUpVerifying: state === RESULT_STATE.verifying && polls >= MAX_POLLS,
    loading,
    payment,
    retryError,
    retryPayment,
    retrying,
    state,
  }
}
