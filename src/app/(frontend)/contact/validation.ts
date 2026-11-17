export type InquiryState = { status: 'idle' | 'error' | 'success'; message: string }

export function validateInquiry(form: FormData) {
  const name = String(form.get('name') ?? '').trim()
  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase()
  const message = String(form.get('message') ?? '').trim()
  const website = String(form.get('website') ?? '')
  if (
    website ||
    name.length < 2 ||
    name.length > 100 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    message.length < 20 ||
    message.length > 5000
  ) {
    return null
  }
  return { name, email, message }
}
