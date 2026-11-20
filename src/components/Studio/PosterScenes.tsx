import Link from 'next/link'
import { PinnedScenes } from './PinnedScenes'
import styles from './Posters.module.css'

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

const lines = [
  ['BUILT FOR', 'THE REAL', 'WORLD.'],
  ['WEB DEVELOPMENT', 'WITHOUT THE', 'AGENCY BLOAT.'],
  ['YOUR SYSTEMS', 'SHOULD TALK', 'TO EACH OTHER.'],
  ['WE BUILD.', 'WE FIX.', 'WE CONNECT.'],
]
const identifiers = ['UI', 'CODE', 'SYS', 'TERMINAL']
const phases = ['Strategy', 'Design', 'Development', 'Deployment']
const nodes = ['E-COMMERCE', 'DATABASES', 'ANALYTICS', 'PAYMENTS', 'SHIPPING', 'INVENTORY']

function TechnicalPanel({ kind }: { kind: string }) {
  const heading =
    kind === 'browser'
      ? 'MISSION PHASES'
      : kind === 'code'
        ? 'PLATFORM.TSX'
        : kind === 'systems'
          ? 'NETWORK MAP'
          : 'DASH10 — TERMINAL'
  return (
    <div className={styles.panel} data-reveal="visual">
      <div className={styles.panelHeader}>
        <span>{heading}</span>
        <span className={styles.status} aria-hidden="true">
          {kind === 'browser' ? '4 / 4' : kind === 'systems' ? 'LINKED' : 'READY'}
        </span>
      </div>
      {kind === 'browser' ? (
        <ol className={styles.phases}>
          {phases.map((phase, i) => (
            <li key={phase}>
              <span>0{i + 1}</span>
              <span>{phase}</span>
              <span aria-hidden="true">✓</span>
              <i aria-hidden="true" />
            </li>
          ))}
        </ol>
      ) : kind === 'systems' ? (
        <>
          <svg
            className={styles.network}
            viewBox="0 0 360 260"
            role="img"
            aria-label="Your platform connected to e-commerce, databases, analytics, payments, shipping, and inventory"
          >
            <g fill="none" stroke="currentColor" strokeOpacity=".45">
              <path d="M180 130L65 45M180 130V35M180 130L295 45M180 130L65 215M180 130V225M180 130L295 215" />
            </g>
            {nodes.map((name, i) => {
              const x = [65, 180, 295][i % 3],
                y = i < 3 ? 40 : 220
              return (
                <g key={name}>
                  <rect x={x - 49} y={y - 15} width="98" height="30" />
                  <text x={x} y={y + 3}>
                    {name}
                  </text>
                </g>
              )
            })}
            <rect x="119" y="111" width="122" height="38" />
            <text x="180" y="133">
              YOUR PLATFORM
            </text>
          </svg>
          <div className={styles.mobileNetwork}>
            <p>YOUR PLATFORM</p>
            <ul>
              {nodes.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <pre className={styles.code}>
          <code>
            {kind === 'code'
              ? `// A solid foundation. Room to grow.
export async function buildExperience() {
  const platform = await connect({
    content: 'Payload',
    framework: 'Next.js',
    purpose: 'Your business',
  })

  return platform.launch({
    performance: true,
    complexity: 'Only what you need',
  })
}`
              : `$ dash10 project:init

✓ Understand the problem
✓ Map the right architecture
✓ Build. Test. Refine.
✓ Connect the moving parts

$ dash10 deploy --production

All systems ready.
Built for what comes next.

› `}
            {kind === 'terminal' && <span className={styles.cursor} aria-hidden="true" />}
          </code>
        </pre>
      )}
    </div>
  )
}

/** Decorative layers are independent of readable panel content. */
function PosterAtmosphere({ kind }: { kind: string }) {
  return (
    <div className={styles.atmosphere} aria-hidden="true" data-atmosphere>
      {kind === 'browser' ? (
        <svg
          className={styles.reticle}
          viewBox="-100 -100 200 200"
          fill="none"
          stroke="currentColor"
          strokeWidth=".8"
        >
          <g className={styles.ring}>
            <circle r="86" strokeDasharray="2 6" />
            <path d="M0-96V-80M0 96V80M-96 0H-80M96 0H80" />
          </g>
          <circle r="38" />
          <path d="M-60 0H-24M24 0H60M0-60V-24M0 24V60" />
          <text x="46" y="-46">
            TGT-01
          </text>
        </svg>
      ) : kind === 'code' ? (
        <div className={styles.codeMotion}>
          <pre>
            {[0, 1].map((i) => (
              <span key={i}>{`const platform = await connect({
  content: 'Payload',
  framework: 'Next.js',
});
platform.launch({ performance: true });
export const revalidate = 60;

`}</span>
            ))}
          </pre>
        </div>
      ) : kind === 'systems' ? (
        <svg
          className={styles.networkMotion}
          viewBox="0 0 400 300"
          fill="none"
          stroke="currentColor"
        >
          <path d="M200 150L60 50M200 150L200 30M200 150L340 50M200 150L60 250M200 150L200 270M200 150L340 250" />
          {[
            [200, 150],
            [60, 50],
            [200, 30],
            [340, 50],
            [60, 250],
            [200, 270],
            [340, 250],
          ].map(([x, y]) => (
            <circle cx={x} cy={y} r="3" key={`${x}-${y}`} />
          ))}
        </svg>
      ) : (
        <span className={styles.deployStatus}>[ SYSTEM READY ]</span>
      )}
    </div>
  )
}

export function PosterScenes() {
  return (
    <PinnedScenes>
      {scenes.map((scene, index) => (
        <section
          className={`studio-scene ${styles.poster}`}
          data-kind={scene.kind}
          key={scene.kind}
          aria-labelledby={`scene-${index}`}
        >
          <PosterAtmosphere kind={scene.kind} />
          <span className={styles.number} aria-hidden="true" data-poster-number>
            0{index + 1}
          </span>
          <div className={styles.hud} aria-hidden="true">
            <span>SECTOR 0{index + 1}</span>
            <span>
              {identifiers[index]} / 00{index + 1}{' '}
              <span className={styles.status}>
                {['ONLINE', 'READY', 'LINKED', 'DEPLOY'][index]}
              </span>
            </span>
          </div>
          <div className={styles.composition}>
            <div className={styles.copy}>
              <p className={`studio-label ${styles.kicker}`}>
                0{index + 1} / {['PURPOSE', 'DEVELOPMENT', 'INTEGRATIONS', 'SOLUTIONS'][index]}
              </p>
              <h2
                id={`scene-${index}`}
                aria-label={scene.title}
                tabIndex={-1}
                data-reveal="heading"
                className={styles.heading}
              >
                <span
                  className={styles.glitch}
                  aria-hidden="true"
                  data-text={lines[index].join('\n')}
                >
                  {lines[index].map((line, i) => (
                    <span className={styles.line} key={line}>
                      {i === lines[index].length - 1 ? (
                        <span className={styles.headlineOutline} data-outline>
                          {line}
                        </span>
                      ) : (
                        line
                      )}{' '}
                    </span>
                  ))}
                </span>
              </h2>
              <p className={styles.lede} data-reveal="copy">
                {scene.copy}
              </p>
              <Link className={`studio-cta ${styles.cta}`} data-reveal="cta" href={scene.href}>
                {scene.cta}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <TechnicalPanel kind={scene.kind} />
          </div>
          <div className={styles.caption} aria-hidden="true">
            <span>DASH 10 / DIGITAL SYSTEMS</span>
            <span>0{index + 1} — 04</span>
          </div>
        </section>
      ))}
    </PinnedScenes>
  )
}
