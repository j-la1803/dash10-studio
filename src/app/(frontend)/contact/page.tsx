import { DesignPage } from '@/components/Replacement/Template'
import { siteMetadata } from '@/utilities/siteMetadata'
export const metadata = siteMetadata(
  '/contact',
  'Let’s Talk | Dash 10 Studio',
  'Tell Dash 10 Studio about your website, e-commerce, or integration project.',
)
export default function Page() { return <DesignPage page="contact" /> }
