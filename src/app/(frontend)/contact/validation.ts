export type InquiryState = { status: 'idle' | 'error' | 'success'; message: string }

export const inquiryServices = [
  'White-label development',
  'Website development / rebuild',
  'Accessibility / ADA improvements',
  'Integrations & automation',
  'Technical support / maintenance',
  'Something else',
] as const

const singleLine = (value: string) => !/[\r\n\u0000-\u001f\u007f]/.test(value)
export const validEmail = (value: string) =>
  value.length <= 254 && singleLine(value) && /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(value)

export function validateInquiry(form: FormData) {
  const read = (key: string) =>
    typeof form.get(key) === 'string' ? String(form.get(key)).trim() : ''
  const name = read('name')
  const email = read('email').toLowerCase()
  const company = read('company')
  let website = read('website')
  const service = read('service')
  const message = read('message')
  const requestId = read('requestId')
  if (
    read('contact_check') ||
    name.length < 2 ||
    name.length > 100 ||
    !singleLine(name) ||
    !validEmail(email) ||
    company.length > 200 ||
    !singleLine(company) ||
    website.length > 2048 ||
    !inquiryServices.some((option) => option === service) ||
    message.length < 20 ||
    message.length > 5000 ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message) ||
    !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(requestId)
  )
    return null
  if (website) {
    try {
      const url = new URL(website)
      if (
        !['https:', 'http:'].includes(url.protocol) ||
        !url.hostname.includes('.') ||
        url.username ||
        url.password
      )
        return null
      website = url.href
    } catch {
      return null
    }
  }
  return { name, email, company, website, service, message, requestId }
}
export type Inquiry = NonNullable<ReturnType<typeof validateInquiry>>
