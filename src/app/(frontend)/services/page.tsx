import { DesignPage } from '@/components/Replacement/Template'
import { siteMetadata } from '@/utilities/siteMetadata'
export const metadata = siteMetadata(
  '/services',
  'Services | Dash 10 Studio',
  'Websites, commerce, and connected systems built around the way your business works.',
)
export default function Page() { return <DesignPage page="services" /> }
