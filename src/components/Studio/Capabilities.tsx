import Image from 'next/image'
import Link from 'next/link'
import { MotionDetails } from './MotionDetails'
import { PosterHeading } from './PosterHeading'
import sizing from './HomepageHeadingSizing.module.css'

const questions = [
  [
    'Can you build a custom website?',
    'Yes. We build custom websites around your business, content, and users, choosing the platform that fits the job.',
  ],
  [
    'Do you build e-commerce websites?',
    'Yes. We build storefronts and connect the systems behind the order, including products, payments, fulfillment, and inventory.',
  ],
  [
    'Can you integrate with our existing systems?',
    'We work with APIs, databases, and automation to connect your tools. We start by reviewing what your current platforms support.',
  ],
  [
    'Do you work with existing websites?',
    'Yes. We can help improve, troubleshoot, and extend an existing platform as well as build something new.',
  ],
  [
    'What technologies do you use?',
    'Our toolkit includes WordPress, Next.js, BigCommerce, Payload, Supabase, and Google Analytics. We choose technology around the requirements.',
  ],
]
export function Capabilities() {
  return (
    <>
      <section className="studio-capabilities" aria-labelledby="capabilities-heading">
        <div className="capabilities-intro">
          <p className="studio-label">CAPABILITIES</p>
          <h2 id="capabilities-heading" className={sizing.capabilities}>
            <PosterHeading
              as="span"
              solid={'THE TECHNICAL\n'}
              outline="SIDE, HANDLED."
              trigger="viewport"
              fontSize="inherit"
              style={{ display: 'block', maxWidth: 'none' }}
            />
          </h2>
          <p className="capabilities-description">
            From custom development to connected systems, we handle the technical work so you can
            focus on running your business.
          </p>
          <Link className="studio-cta" href="/contact">
            HAVE A PROJECT IN MIND? <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="capabilities-list">
          {questions.map(([question, answer]) => (
            <MotionDetails key={question} question={question}>
              <p>{answer}</p>
            </MotionDetails>
          ))}
        </div>
      </section>
      <section className="studio-values" aria-label="The studio">
        {[
          ['milwaukee', 'BUILT IN MILWAUKEE', 'Local, accountable, easy to reach.'],
          ['shield-check', 'VETERAN OWNED', 'Discipline, clear communication, follow-through.'],
          [
            'crosshair',
            'FOCUSED ON WHAT MATTERS',
            'No bloat. Just the work that moves you forward.',
          ],
        ].map(([icon, title, copy]) => (
          <div key={title}>
            <Image
              unoptimized
              src={`/brand/icons/white/${icon}.svg`}
              width={36}
              height={36}
              alt=""
            />
            <div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          </div>
        ))}
      </section>
    </>
  )
}
