/** Chuyển sang cổng thanh toán SePay: POST form ẩn tới checkoutUrl với các field đã ký */
export const submitCheckoutForm = ({ checkoutUrl, fields }) => {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = checkoutUrl

  Object.entries(fields ?? {}).forEach(([name, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value ?? ''
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
}
