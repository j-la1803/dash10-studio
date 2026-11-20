import { DisplayTitle } from '@/components/Studio/DisplayTitle'
import Link from 'next/link'
import { siteMetadata } from '@/utilities/siteMetadata'
export const metadata = siteMetadata(
  '/about',
  'About Dash 10 Studio | Dash 10 Studio',
  'Dash 10 Studio is an independent digital studio focused on custom websites, e-commerce platforms, and connected systems.',
)
export default function Page() {
  return (
    <main id="main-content" className="studio-page">
      <p className="studio-label">ABOUT DASH 10 STUDIO</p>
      <h1>
        <DisplayTitle outline="YOUR BUSINESS.">BUILT AROUND </DisplayTitle>
      </h1>
      <p>
        Dash 10 Studio is an independent digital studio focused on custom websites, e-commerce
        platforms, and connected systems.
      </p>
      <div className="detail-grid">
        <section>
          <h2>Practical by design</h2>
          <p>
            Technology should make your work easier. We focus on reliable solutions, clear
            communication, and the complexity a project actually needs.
          </p>
        </section>
        <section>
          <h2>Connected thinking</h2>
          <p>
            The website is one part of a larger system. Content, commerce, data, and operations work
            better when they are considered together.
          </p>
        </section>
      </div>
      <Link className="studio-cta" href="/contact">
        LET’S TALK <span aria-hidden="true">↗</span>
      </Link>
    </main>
  )
}
