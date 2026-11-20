import Link from 'next/link'
import { siteMetadata } from '@/utilities/siteMetadata'
export const metadata = siteMetadata(
  '/services',
  'Services | Dash 10 Studio',
  'Websites, commerce, and connected systems built around the way your business works.',
)
export default function Page() {
  return (
    <main id="main-content" className="studio-page">
      <p className="studio-label">SERVICES</p>
      <h1>THE RIGHT TOOLS. REAL-WORLD RESULTS.</h1>
      <p>Websites, commerce, and connected systems built around the way your business works.</p>
      <div className="detail-grid">
        <section id="web-development">
          <h2>Web development</h2>
          <p>
            Custom websites with WordPress, Next.js, and Payload. Clear content management,
            responsive interfaces, and performance considered from the start.
          </p>
        </section>
        <section id="ecommerce">
          <h2>E-commerce</h2>
          <p>
            Commerce experiences that support your products, your customers, and your operations.
            From storefronts to the systems behind the order.
          </p>
        </section>
        <section id="integrations">
          <h2>Systems &amp; integrations</h2>
          <p>
            APIs, databases, payments, shipping, inventory, and analytics connected around a clear
            flow of information.
          </p>
        </section>
        <section id="support">
          <h2>Technical solutions</h2>
          <p>
            Troubleshooting, platform improvements, and practical support for existing systems.
            Start with the problem and find a path forward.
          </p>
        </section>
      </div>
      <Link className="studio-cta" href="/contact">
        LET’S TALK <span aria-hidden="true">↗</span>
      </Link>
    </main>
  )
}
