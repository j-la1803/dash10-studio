import Link from 'next/link'
export function LegalReviewPage({ title }: { title: string }) {
  return (
    <main id="main-content" className="studio-page legal-review">
      <p className="studio-label">OWNER REVIEW PENDING</p>
      <h1>{title}</h1>
      <p>This page is being prepared for review. The policy text has not been published.</p>
      <p>
        For questions, contact <a href="mailto:justin@dash10.studio">justin@dash10.studio</a>.
      </p>
      <Link className="studio-cta" href="/contact">
        CONTACT DASH 10 <span aria-hidden="true">↗</span>
      </Link>
    </main>
  )
}
