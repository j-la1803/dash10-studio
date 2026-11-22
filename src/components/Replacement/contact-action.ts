'use server'
import { submitInquiry } from '@/app/(frontend)/contact/actions'
import { validateInquiry, type InquiryState } from '@/app/(frontend)/contact/validation'
import { contactServices } from './contact-options'

export async function submitDesignInquiry(
  previous: InquiryState,
  data: FormData,
): Promise<InquiryState> {
  const need = data.get('need')
  const service =
    typeof need === 'string' && Object.hasOwn(contactServices, need) ? contactServices[need] : null
  if (!service) return { status: 'error', message: 'Please select what you need.' }
  data.set('service', service)
  // Validate the actual visitor message before adding the source design's selected label.
  if (!validateInquiry(data))
    return {
      status: 'error',
      message: 'Check your name, email and project details (between 20 and 4,800 characters).',
    }
  data.set('message', `What do you need? ${need}\n\n${String(data.get('message'))}`)
  return submitInquiry(previous, data)
}
