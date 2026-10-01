import { PaymentResultView } from './PaymentResultView.jsx'
import { usePaymentResult } from './usePaymentResult.js'

const PaymentResultPage = () => {
  const paymentResult = usePaymentResult()

  return <PaymentResultView {...paymentResult} />
}

export default PaymentResultPage
