import type { ReactNode } from 'react'

// Publication date in the studio's America/Chicago time zone.
export const legalEffectiveDate = '2026-11-18'

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main id="main-content" className="studio-post">
      <article aria-labelledby="legal-title">
        <header className="studio-post-heading">
          <p className="studio-label">DASH 10 STUDIO</p>
          <h1 id="legal-title" className="text-4xl md:text-6xl">
            {title}
          </h1>
          <p className="studio-post-excerpt">
            Effective date: <time dateTime={legalEffectiveDate}>November 18, 2026</time>
          </p>
        </header>
        <div className="studio-post-reading prose prose-invert">{children}</div>
      </article>
    </main>
  )
}
