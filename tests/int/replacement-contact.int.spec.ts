import { beforeEach, describe, expect, it, vi } from 'vitest'
import { submitDesignInquiry } from '@/components/Replacement/contact-action'
import { contactServices } from '@/components/Replacement/contact-options'
import { submitInquiry } from '@/app/(frontend)/contact/actions'
vi.mock('@/app/(frontend)/contact/actions', () => ({ submitInquiry: vi.fn() }))
const mocked = vi.mocked(submitInquiry)
const previous = { status: 'idle' as const, message: '' }
function fields(
  need = 'A new website',
  message = 'Synthetic replacement design inquiry for validation testing.',
) {
  const data = new FormData()
  Object.entries({
    name: 'Design QA',
    email: 'qa@example.com',
    company: 'Example',
    need,
    message,
    requestId: '4d50acb1-8e5e-40d7-a7cd-f5e42e501b34',
  }).forEach(([k, v]) => data.set(k, v))
  return data
}
beforeEach(() => {
  vi.clearAllMocks()
  mocked.mockResolvedValue({ status: 'success', message: 'Saved' })
})
describe('approved five-field contact design', () => {
  it.each(Object.keys(contactServices))('maps %s without new CMS fields', async (need) => {
    const data = fields(need)
    expect((await submitDesignInquiry(previous, data)).status).toBe('success')
    const saved = mocked.mock.calls[0][1]
    expect(saved.get('service')).toBe(contactServices[need])
    expect(saved.get('message')).toContain(`What do you need? ${need}`)
    expect(saved.get('message')).toContain('Synthetic replacement design inquiry')
    expect(saved.has('website')).toBe(false)
  })
  it.each(['short', ''])('rejects short raw messages before adding labels', async (message) => {
    expect((await submitDesignInquiry(previous, fields('A new website', message))).status).toBe(
      'error',
    )
    expect(mocked).not.toHaveBeenCalled()
  })
  it('preserves spam validation', async () => {
    const data = fields()
    data.set('contact_check', 'bot')
    expect((await submitDesignInquiry(previous, data)).status).toBe('error')
    expect(mocked).not.toHaveBeenCalled()
  })
  it('does not call storage on invalid services', async () => {
    expect((await submitDesignInquiry(previous, fields('invented'))).status).toBe('error')
    expect(mocked).not.toHaveBeenCalled()
  })
})
