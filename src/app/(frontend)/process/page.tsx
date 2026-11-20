import Link from 'next/link'
import { siteMetadata } from '@/utilities/siteMetadata'
export const metadata = siteMetadata(
  '/process',
  'Process | Dash 10 Studio',
  'A practical process that keeps the work connected to your goals.',
)
export default function Page() {
  return (
    <main id="main-content" className="studio-page">
      <p className="studio-label">PROCESS</p>
      <h1>CLEAR THINKING. SOLID EXECUTION.</h1>
      <p>A practical process that keeps the work connected to your goals.</p>
      <div className="detail-grid">
        <section>
          <h2>01 / Understand</h2>
          <p>
            We start with your business, your users, and the problem to solve. Together we define
            priorities, constraints, and what success means.
          </p>
        </section>
        <section>
          <h2>02 / Plan</h2>
          <p>
            Map the architecture, content, and integrations. Choose technology for the job and
            define a clear scope before building.
          </p>
        </section>
        <section>
          <h2>03 / Build</h2>
          <p>
            Develop in focused stages with room for feedback. Test the experience across devices and
            check the systems behind it.
          </p>
        </section>
        <section>
          <h2>04 / Launch &amp; evolve</h2>
          <p>
            Prepare content, validate the critical paths, and plan the handoff. Build a foundation
            that can keep improving as your needs change.
          </p>
        </section>
      </div>
      <Link className="studio-cta" href="/contact">
        LET’S TALK <span aria-hidden="true">↗</span>
      </Link>
    </main>
  )
}
