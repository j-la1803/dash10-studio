import { LegalReviewPage } from '@/components/Studio/LegalReviewPage'
import { siteMetadata } from '@/utilities/siteMetadata'
export const metadata = {
  ...siteMetadata(
    '/terms',
    'Website Terms of Use | Dash 10 Studio',
    'Website Terms of Use — owner review pending.',
  ),
  robots: { index: false, follow: true },
}
export default function Page() {
  return <LegalReviewPage title="Website Terms of Use" />
}
