import { DesignPage } from '@/components/Replacement/Template'
import { siteMetadata } from '@/utilities/siteMetadata'
export const metadata = siteMetadata(
  '/process',
  'Process | Dash 10 Studio',
  'A practical process that keeps the work connected to your goals.',
)
export default function Page() { return <DesignPage page="process" /> }
