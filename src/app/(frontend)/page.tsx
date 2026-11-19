import { StudioHome } from '@/components/Studio/Home'
import { siteMetadata } from '@/utilities/siteMetadata'

// Keep the homepage independent of generic CMS block/preview client bundles.
// CMS-managed supporting pages retain their existing [slug] route.
export default function HomePage() {
  return <StudioHome />
}

export const metadata = siteMetadata(
  '/',
  'Dash 10 Studio — The right technology. Built the right way.',
  'Custom websites, e-commerce platforms, and connected systems engineered to move your business forward.',
)
