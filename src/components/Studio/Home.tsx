import { TechnologyMarquee } from './TechnologyMarquee'
import Image from 'next/image'
import Link from 'next/link'
import { PinnedScenes } from './PinnedScenes'
import { Capabilities } from './Capabilities'
import { VideoHero } from '@/components/VideoHero'

const scenes = [
  {
    title: 'BUILT FOR THE REAL WORLD.',
    copy: 'We build websites and digital platforms around how your business actually works. No unnecessary complexity. Just reliable technology designed to do its job.',
    cta: 'EXPLORE SERVICES',
    href: '/services',
    kind: 'browser',
  },
  {
    title: 'WEB DEVELOPMENT WITHOUT THE AGENCY BLOAT.',
    copy: 'Custom builds, modern frameworks, and scalable architecture. From WordPress to Next.js, we focus on clean code, fast performance, and solutions that are built to last.',
    cta: 'VIEW OUR PROCESS',
    href: '/process',
    kind: 'code',
  },
  {
    title: 'YOUR SYSTEMS SHOULD TALK TO EACH OTHER.',
    copy: 'API integrations, databases, analytics, and automation that connect the dots. We help your tools work together so information flows where it needs to.',
    cta: 'SEE INTEGRATIONS',
    href: '/services#integrations',
    kind: 'systems',
  },
  {
    title: 'WE BUILD. WE FIX. WE CONNECT.',
    copy: "New projects. Existing platforms. Complicated problems. Whether you're starting from scratch or trying to make an existing system work better, we can help you move forward.",
    cta: 'START A PROJECT',
    href: '/contact',
    kind: 'terminal',
  },
]
const platforms = [
  ['WordPress', 'wordpress'],
  ['Next.js', 'nextdotjs'],
  ['BigCommerce', 'bigcommerce'],
  ['Payload CMS', 'payloadcms'],
  ['Supabase', 'supabase'],
  ['Google Analytics', 'googleanalytics'],
  ['Google Tag Manager', 'googletagmanager'],
  ['HubSpot', null],
]

function Illustration({ kind }: { kind: string }) {
  if (kind === 'systems')
    return (
      <div
        data-reveal="visual"
        className="systems-visual"
        role="img"
        aria-label="Your platform connected to e-commerce, databases, payments, analytics, shipping, and inventory"
      >
        <svg viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M300 200V50 M300 200L100 120 M300 200L100 280 M300 200L500 120 M300 200L500 280 M300 200V350"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
        <div className="system-hub">YOUR PLATFORM</div>
        {['E-COMMERCE', 'DATABASES', 'PAYMENTS', 'ANALYTICS', 'SHIPPING', 'INVENTORY'].map(
          (name, i) => (
            <div className={`system-node system-node-${i}`} key={name}>
              {name}
            </div>
          ),
        )}
      </div>
    )

  return (
    <div
      data-reveal="visual"
      className={`studio-window ${kind}`}
      role="img"
      aria-label={`${kind === 'browser' ? 'Dash 10 website concept' : kind === 'code' ? 'Clean, structured application code' : 'Technical build and deployment workflow'}`}
    >
      <div className="window-bar">
        <span>● ● ●</span>
        <span>
          {kind === 'browser'
            ? 'dash10 / digital experience'
            : kind === 'code'
              ? 'platform.tsx'
              : 'dash10 — terminal'}
        </span>
        <span>↗</span>
      </div>
      {kind === 'browser' ? (
        <div className="browser-preview">
          <Image
            unoptimized
            src="/brand/logo/dash10-studio-primary-white.svg"
            width={100}
            height={57}
            alt=""
          />
          <p>
            STRATEGY.
            <br />
            DESIGN.
            <br />
            DEVELOPMENT.
            <br />
            <span>DEPLOYMENT.</span>
          </p>
          <div className="preview-grid">
            <span>STRATEGY ↗</span>
            <span>DEVELOPMENT ↗</span>
            <span>INTEGRATIONS ↗</span>
          </div>
        </div>
      ) : (
        <pre>
          {kind === 'code'
            ? `01  // A solid foundation. Room to grow.\n02  export async function buildExperience() {\n03    const platform = await connect({\n04      content: 'Payload',\n05      framework: 'Next.js',\n06      purpose: 'Your business',\n07    })\n08\n09    return platform.launch({\n10      performance: true,\n11      complexity: 'Only what you need',\n12    })\n13  }`
            : `$ dash10 project:init\n\n  ✓ Understand the problem\n  ✓ Map the right architecture\n  ✓ Build. Test. Refine.\n  ✓ Connect the moving parts\n\n$ dash10 deploy --production\n\n  All systems ready.\n  Built for what comes next.\n\n› _`}
        </pre>
      )}
    </div>
  )
}

export function StudioHome() {
  return (
    <main id="main-content" className="dash-home">
      <VideoHero
        eyebrow="DIGITAL DEVELOPMENT STUDIO"
        lines={['THE RIGHT', 'TECHNOLOGY.', 'BUILT THE', 'RIGHT WAY.']}
        video="/videos/dash-10-video-bg-faststart.mp4"
        playbackRate={0.6}
      />
      <TechnologyMarquee>
        <div className="platform-track">
          {[false, true].map((duplicate) => (
            <div
              className="platform-grid"
              key={String(duplicate)}
              aria-hidden={duplicate || undefined}
            >
              {platforms.map(([name, icon]) => (
                <div key={name}>
                  {icon && (
                    <Image
                      unoptimized
                      src={`/platforms/${icon}.svg`}
                      alt=""
                      width={48}
                      height={48}
                    />
                  )}
                  <span>{name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </TechnologyMarquee>
      <PinnedScenes>
        {scenes.map((scene, i) => (
          <section className="studio-scene" key={scene.kind} aria-labelledby={`scene-${i}`}>
            <div className="scene-sticky">
              <span className="scene-index" aria-hidden="true">
                0{i + 1}
              </span>
              <div className="scene-copy">
                <p className="studio-label">
                  0{i + 1} / {['PURPOSE', 'DEVELOPMENT', 'INTEGRATIONS', 'SOLUTIONS'][i]}
                </p>
                <h2 data-reveal="heading" id={`scene-${i}`} tabIndex={-1}>
                  {[
                    ['BUILT FOR', 'THE REAL', 'WORLD.'],
                    ['WEB', 'DEVELOPMENT', 'WITHOUT THE', 'AGENCY BLOAT.'],
                    ['YOUR SYSTEMS', 'SHOULD TALK', 'TO EACH', 'OTHER.'],
                    ['WE BUILD.', 'WE FIX.', 'WE CONNECT.'],
                  ][i].map((line) => (
                    <span className="scene-title-line" key={line}>
                      {line}{' '}
                    </span>
                  ))}
                </h2>
                <p data-reveal="copy">{scene.copy}</p>
                <Link data-reveal="cta" className="studio-cta" href={scene.href}>
                  {scene.cta}
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <Illustration kind={scene.kind} />
            </div>
            <div className="scene-meta" aria-hidden="true">
              {['UI', 'CODE', 'SYS', 'TERM'][i]} / 00{i + 1}
            </div>
          </section>
        ))}
      </PinnedScenes>
      <Capabilities />
    </main>
  )
}
