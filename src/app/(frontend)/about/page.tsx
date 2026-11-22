import { DesignPage } from '@/components/Replacement/Template'
import { siteMetadata } from '@/utilities/siteMetadata'
export const metadata = siteMetadata(
  '/about',
  'About Dash 10 Studio | Dash 10 Studio',
  'Dash 10 Studio is an independent digital studio focused on custom websites, e-commerce platforms, and connected systems.',
)
export default function Page() { return <DesignPage page="about" /> }
