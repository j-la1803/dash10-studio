import { DesignPage } from '@/components/Replacement/Template'
import { siteMetadata } from '@/utilities/siteMetadata'
export const revalidate = 600
export const metadata = siteMetadata('/blog', 'Blog | Dash 10 Studio', 'Practical writing on web development, e-commerce and the systems behind a business.')
export default function Page() { return <DesignPage page="blog" /> }
