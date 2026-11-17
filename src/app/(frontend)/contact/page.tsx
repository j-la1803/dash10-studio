import type { Metadata } from 'next'
import { ContactForm } from '@/components/Studio/ContactForm'
export const metadata: Metadata = {
  title: 'Let’s Talk | Dash 10 Studio',
  description: 'Tell Dash 10 Studio about your website, e-commerce, or integration project.',
}
export default function ContactPage() {
  const email = process.env.CONTACT_EMAIL || 'justin@dash10.studio'
  return (
    <main id="main-content" className="studio-page">
      <p className="studio-label">LET’S TALK</p>
      <h1>WHAT’S YOUR NEXT MOVE?</h1>
      <p>
        A new website. A better storefront. Systems that need to connect. Tell us what you’re
        working on, what’s getting in the way, and where you want to go.
      </p>
      {email ? (
        <a
          className="studio-cta"
          href={`mailto:${email}?subject=Let%E2%80%99s%20talk%20about%20a%20project`}
        >
          {email}
          <span aria-hidden="true">↗</span>
        </a>
      ) : (
        <p className="contact-pending">Project inquiries will open here soon.</p>
      )}
      <ContactForm />
      <div className="detail-grid">
        <section>
          <h2>A useful starting point.</h2>
          <p>
            Share a little about your business, the project you have in mind, your current platform,
            and any timing or budget you’re working with.
          </p>
        </section>
        <section>
          <h2>Let’s find the right path.</h2>
          <p>
            We’ll start with your goals and the problem to solve, then work out what the project
            needs.
          </p>
        </section>
      </div>
    </main>
  )
}
