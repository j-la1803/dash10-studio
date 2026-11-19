import { LegalReviewPage } from '@/components/Studio/LegalReviewPage'
import { siteMetadata } from '@/utilities/siteMetadata'
export const metadata = {
  ...siteMetadata(
    '/privacy',
    'Privacy Policy | Dash 10 Studio',
    'Privacy Policy — owner review pending.',
  ),
  robots: { index: false, follow: true },
}
export default function Page() {
  return <LegalReviewPage title="Privacy Policy" />
}
