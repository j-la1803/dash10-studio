import { DisplayTitle } from '@/components/Studio/DisplayTitle'
import { siteMetadata } from '@/utilities/siteMetadata'
import { HubSpotForm } from '@/components/Integrations/HubSpotForm'
import { hubSpotConfig } from '@/utilities/integrations/config'
import { ContactForm } from '@/components/Studio/ContactForm'
export const metadata = siteMetadata(
  '/contact',
  'Let’s Talk | Dash 10 Studio',
  'Tell Dash 10 Studio about your website, e-commerce, or integration project.',
)
export default function ContactPage() {
  return (
    <main id="main-content" className="studio-page">
      <p className="studio-label">LET’S TALK</p>
      <h1>
        <DisplayTitle outline="NEXT MOVE?">WHAT’S YOUR </DisplayTitle>
      </h1>
      <p>
        A new website. A better storefront. Systems that need to connect. Tell us what you’re
        working on, what’s getting in the way, and where you want to go.
      </p>
      <HubSpotForm config={hubSpotConfig(process.env)} fallback={<ContactForm />} />
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
