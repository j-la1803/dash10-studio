import { PosterHeading } from './PosterHeading'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { Posters80Motion } from './Posters80Motion'
import styles from './Posters80.module.css'

// Reference markup is server-rendered; only scroll/entry state runs on the client.
export function Posters80() {
  return (
    <Posters80Motion>
      <div className={styles.railBounds}>
        <nav className={styles['rail']} aria-label="Section progress">
          <span className={styles['pct']} data-rail-pct="">
            {'00'}
          </span>
          <div
            className={styles['track']}
            data-rail-track=""
            role="progressbar"
            aria-label="Storytelling progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
          >
            <div className={styles['fill']}></div>
            <div className={styles['tick']} style={{ top: '12%' } as CSSProperties}>
              <b>{'01'}</b>
            </div>
            <div className={styles['tick']} style={{ top: '37%' } as CSSProperties}>
              <b>{'02'}</b>
            </div>
            <div className={styles['tick']} style={{ top: '62%' } as CSSProperties}>
              <b>{'03'}</b>
            </div>
            <div className={styles['tick']} style={{ top: '87%' } as CSSProperties}>
              <b>{'04'}</b>
            </div>
          </div>
          <span className={styles['lbl']} data-rail-lbl="">
            {'UI / 001'}
          </span>
        </nav>
      </div>
      <section
        className={styles['poster']}
        id="services"
        data-lbl="UI / 001"
        style={{ '--pos': '62% 35%', '--zoom': '1.18' } as CSSProperties}
        aria-labelledby="poster-title-built-for"
        data-poster=""
      >
        <div className={styles['media']} aria-hidden="true">
          <div className={styles['ov']}>
            <div className={styles['ret']}>
              <svg
                viewBox="-100 -100 200 200"
                fill="none"
                stroke="#fff"
                strokeWidth=".8"
                aria-hidden="true"
              >
                <g className={styles['ring']}>
                  <circle r="86" strokeDasharray="2 6"></circle>
                  <path d="M0-96V-80M0 96V80M-96 0H-80M96 0H80" strokeWidth="1.4"></path>
                </g>
                <circle r="38"></circle>
                <path d="M-60 0H-24M24 0H60M0-60V-24M0 24V60"></path>
                <text x="46" y="-46">
                  {'TGT-01'}
                </text>
              </svg>
            </div>
          </div>
          <div className={styles['grain']}></div>
          <div className={styles['scan']}></div>
        </div>
        <i className={styles['crop'] + ' ' + styles['tl']} aria-hidden="true"></i>
        <i className={styles['crop'] + ' ' + styles['tr']} aria-hidden="true"></i>
        <i className={styles['crop'] + ' ' + styles['bl']} aria-hidden="true"></i>
        <i className={styles['crop'] + ' ' + styles['br']} aria-hidden="true"></i>
        <div className={styles['num']} aria-hidden="true">
          {'01'}
        </div>
        <div className={styles['hud']}>
          <span>
            <span className={styles['sec']}>{'SECTOR 01'}</span>
            {' // UI / 001'}
          </span>
          <span className={styles['live']}>{'Online'}</span>
        </div>
        <div className={styles['body']}>
          <div className={styles['kicker']}>
            <em>{'01'}</em>
            <span></span>
            {'Services'}
          </div>
          <PosterHeading
            as="h2"
            id="poster-title-built-for"
            solid={'Built for\nthe real\n'}
            outline={'world.'}
          />
          <p className={styles['lede']}>
            {
              'We build websites and digital platforms around how your business actually works. No unnecessary complexity. Just reliable technology designed to do its job.'
            }
          </p>
          <Link className={styles['cta']} href="/services" data-studio-cta="">
            {'Explore services '}
            <svg
              width="16"
              height="16"
              viewBox="0 0 48 48"
              fill="none"
              strokeWidth="4.5"
              strokeLinecap="square"
              aria-hidden="true"
            >
              <path d="M12 36L36 12M16 12H36V32"></path>
            </svg>
          </Link>
        </div>
        <div className={styles['spec']}>
          <header>
            <span>{'Mission phases'}</span>
            <b>{'4 / 4'}</b>
          </header>
          <div className={styles['phase']}>
            <i>{'01'}</i>
            <span>{'Strategy'}</span>
            <s>{'Locked'}</s>
            <div className={styles['bar']} style={{ '--w': '100%' } as CSSProperties}></div>
          </div>
          <div className={styles['phase']}>
            <i>{'02'}</i>
            <span>{'Design'}</span>
            <s>{'Locked'}</s>
            <div className={styles['bar']} style={{ '--w': '100%' } as CSSProperties}></div>
          </div>
          <div className={styles['phase']}>
            <i>{'03'}</i>
            <span>{'Development'}</span>
            <s>{'Active'}</s>
            <div className={styles['bar']} style={{ '--w': '72%' } as CSSProperties}></div>
          </div>
          <div className={styles['phase']}>
            <i>{'04'}</i>
            <span>{'Deployment'}</span>
            <s>{'Standby'}</s>
            <div className={styles['bar']} style={{ '--w': '18%' } as CSSProperties}></div>
          </div>
        </div>
        <div className={styles['foot']}>
          <span>{'43.0389\u00b0 N'}</span>
          <span>{'87.9065\u00b0 W'}</span>
        </div>
      </section>
      <section
        className={styles['poster']}
        id="work"
        data-lbl="CODE / 002"
        style={{ '--pos': '30% 40%', '--flip': '-1', '--zoom': '1.25' } as CSSProperties}
        aria-labelledby="poster-title-web-dev"
        data-poster=""
      >
        <div className={styles['media']} aria-hidden="true">
          <div className={styles['ov']}>
            <div className={styles['codefall']}>
              <pre>
                {
                  "const platform = await connect({\n  content: 'Payload',\n  framework: 'Next.js',\n});\nplatform.launch({ performance: true });\nexport const revalidate = 60;\nasync function build() {\n  await db.migrate();\n  await cache.warm();\n  return deploy();\n}\nconst platform = await connect({\n  content: 'Payload',\n  framework: 'Next.js',\n});\nplatform.launch({ performance: true });\nexport const revalidate = 60;\nasync function build() {\n  await db.migrate();\n  await cache.warm();\n  return deploy();\n}"
                }
              </pre>
            </div>
          </div>
          <div className={styles['grain']}></div>
          <div className={styles['scan']}></div>
        </div>
        <i className={styles['crop'] + ' ' + styles['tl']} aria-hidden="true"></i>
        <i className={styles['crop'] + ' ' + styles['tr']} aria-hidden="true"></i>
        <i className={styles['crop'] + ' ' + styles['bl']} aria-hidden="true"></i>
        <i className={styles['crop'] + ' ' + styles['br']} aria-hidden="true"></i>
        <div className={styles['num']} aria-hidden="true">
          {'02'}
        </div>
        <div className={styles['hud']}>
          <span>
            <span className={styles['sec']}>{'SECTOR 02'}</span>
            {' // CODE / 002'}
          </span>
          <span className={styles['live']}>{'Online'}</span>
        </div>
        <div className={styles['body']}>
          <div className={styles['kicker']}>
            <em>{'02'}</em>
            <span></span>
            {'Development'}
          </div>
          <PosterHeading
            as="h2"
            id="poster-title-web-dev"
            solid={'Web dev\nwithout the\n'}
            outline={'agency bloat.'}
          />
          <p className={styles['lede']}>
            {
              'Custom builds, modern frameworks, and scalable architecture. From WordPress to Next.js, we focus on clean code, fast performance, and solutions that are built to last.'
            }
          </p>
          <Link className={styles['cta']} href="/process" data-studio-cta="">
            {'View our process '}
            <svg
              width="16"
              height="16"
              viewBox="0 0 48 48"
              fill="none"
              strokeWidth="4.5"
              strokeLinecap="square"
              aria-hidden="true"
            >
              <path d="M12 36L36 12M16 12H36V32"></path>
            </svg>
          </Link>
        </div>
        <div className={styles['spec']}>
          <header>
            <span>{'platform.js'}</span>
            <b>{'Ready'}</b>
          </header>
          <div
            className={styles['in-body']}
            tabIndex={0}
            role="region"
            aria-label="Technical code panel"
          >
            <span className={styles['d']}>{'// A solid foundation. Room to grow.'}</span>
            {'\n'}
            <span className={styles['k']}>{'export async function'}</span>
            {' build() {\n  '}
            <span className={styles['k']}>{'const'}</span>
            {' platform = '}
            <span className={styles['k']}>{'await'}</span>
            {
              " connect({\n    content: 'Payload',\n    framework: 'Next.js',\n    purpose: 'Your business',\n  });\n  "
            }
            <span className={styles['k']}>{'return'}</span>
            {' platform.launch({\n    performance: '}
            <span className={styles['k']}>{'true'}</span>
            {",\n    complexity: 'Only what you need',\n  });\n}"}
          </div>
        </div>
        <div className={styles['foot']}>
          <span>{'Clean code'}</span>
          <span>{'Fast by default'}</span>
        </div>
      </section>
      <section
        className={styles['poster']}
        id="integrations"
        data-lbl="SYS / 003"
        style={{ '--pos': '75% 55%', '--zoom': '1.3' } as CSSProperties}
        aria-labelledby="poster-title-your-systems"
        data-poster=""
      >
        <div className={styles['media']} aria-hidden="true">
          <div className={styles['ov']}>
            <svg className={styles['net']} viewBox="0 0 400 300" fill="none" aria-hidden="true">
              <g className={styles['w']} fill="none">
                <path d="M200 150L60 50M200 150L200 30M200 150L340 50M200 150L60 250M200 150L200 270M200 150L340 250"></path>
              </g>
              <circle cx="200" cy="150" r="7"></circle>
              <circle
                cx="60"
                cy="50"
                r="4"
                style={{ animationDelay: '.2s' } as CSSProperties}
              ></circle>
              <circle
                cx="200"
                cy="30"
                r="4"
                style={{ animationDelay: '.6s' } as CSSProperties}
              ></circle>
              <circle
                cx="340"
                cy="50"
                r="4"
                style={{ animationDelay: '1s' } as CSSProperties}
              ></circle>
              <circle
                cx="60"
                cy="250"
                r="4"
                style={{ animationDelay: '1.4s' } as CSSProperties}
              ></circle>
              <circle
                cx="200"
                cy="270"
                r="4"
                style={{ animationDelay: '1.8s' } as CSSProperties}
              ></circle>
              <circle
                cx="340"
                cy="250"
                r="4"
                style={{ animationDelay: '2.1s' } as CSSProperties}
              ></circle>
            </svg>
          </div>
          <div className={styles['grain']}></div>
          <div className={styles['scan']}></div>
        </div>
        <i className={styles['crop'] + ' ' + styles['tl']} aria-hidden="true"></i>
        <i className={styles['crop'] + ' ' + styles['tr']} aria-hidden="true"></i>
        <i className={styles['crop'] + ' ' + styles['bl']} aria-hidden="true"></i>
        <i className={styles['crop'] + ' ' + styles['br']} aria-hidden="true"></i>
        <div className={styles['num']} aria-hidden="true">
          {'03'}
        </div>
        <div className={styles['hud']}>
          <span>
            <span className={styles['sec']}>{'SECTOR 03'}</span>
            {' // SYS / 003'}
          </span>
          <span className={styles['live']}>{'Linked'}</span>
        </div>
        <div className={styles['body']}>
          <div className={styles['kicker']}>
            <em>{'03'}</em>
            <span></span>
            {'Integrations'}
          </div>
          <PosterHeading
            as="h2"
            id="poster-title-your-systems"
            solid={'Your systems\nshould talk\n'}
            outline={'to each other.'}
          />
          <p className={styles['lede']}>
            {
              'API integrations, databases, analytics, and automation that connect the tools your business uses so information flows where it needs to.'
            }
          </p>
          <Link className={styles['cta']} href="/services#integrations" data-studio-cta="">
            {'See integrations '}
            <svg
              width="16"
              height="16"
              viewBox="0 0 48 48"
              fill="none"
              strokeWidth="4.5"
              strokeLinecap="square"
              aria-hidden="true"
            >
              <path d="M12 36L36 12M16 12H36V32"></path>
            </svg>
          </Link>
        </div>
        <div className={styles['spec']}>
          <header>
            <span>{'Network map'}</span>
            <b>{'6 nodes'}</b>
          </header>
          <svg
            className={styles['lattice']}
            viewBox="0 0 320 190"
            role="img"
            aria-label="Your platform connected to e-commerce, databases, analytics, payments, shipping and inventory"
          >
            <g className={styles['w']} fill="none">
              <path
                className={styles['w']}
                d="M160 95L60 28M160 95L160 24M160 95L260 28M160 95L60 162M160 95L160 166M160 95L260 162"
              ></path>
            </g>
            <g>
              <rect className={styles['n']} x="20" y="14" width="80" height="28"></rect>
              <text x="60" y="32">
                {'E-commerce'}
              </text>
              <rect className={styles['n']} x="120" y="10" width="80" height="28"></rect>
              <text x="160" y="28">
                {'Databases'}
              </text>
              <rect className={styles['n']} x="220" y="14" width="80" height="28"></rect>
              <text x="260" y="32">
                {'Analytics'}
              </text>
              <rect className={styles['n']} x="20" y="148" width="80" height="28"></rect>
              <text x="60" y="166">
                {'Payments'}
              </text>
              <rect className={styles['n']} x="120" y="152" width="80" height="28"></rect>
              <text x="160" y="170">
                {'Shipping'}
              </text>
              <rect className={styles['n']} x="220" y="148" width="80" height="28"></rect>
              <text x="260" y="166">
                {'Inventory'}
              </text>
              <rect
                x="110"
                y="79"
                width="100"
                height="32"
                fill="#000"
                stroke="var(--accent)"
              ></rect>
              <text x="160" y="99" style={{ fill: 'var(--accent)' } as CSSProperties}>
                {'Your platform'}
              </text>
            </g>
          </svg>
        </div>
        <div className={styles['foot']}>
          <span>{'APIs'}</span>
          <span>{'Data flows where it should'}</span>
        </div>
      </section>
      <section
        className={styles['poster']}
        id="process"
        data-lbl="TERMINAL / 004"
        style={{ '--pos': '45% 30%', '--flip': '-1', '--zoom': '1.15' } as CSSProperties}
        aria-labelledby="poster-title-we-build"
        data-poster=""
      >
        <div className={styles['media']} aria-hidden="true">
          <div className={styles['ov']}>
            <div className={styles['sweep']}></div>
            <div className={styles['rec']}>{'[ REC ]'}</div>
          </div>
          <div className={styles['grain']}></div>
          <div className={styles['scan']}></div>
        </div>
        <i className={styles['crop'] + ' ' + styles['tl']} aria-hidden="true"></i>
        <i className={styles['crop'] + ' ' + styles['tr']} aria-hidden="true"></i>
        <i className={styles['crop'] + ' ' + styles['bl']} aria-hidden="true"></i>
        <i className={styles['crop'] + ' ' + styles['br']} aria-hidden="true"></i>
        <div className={styles['num']} aria-hidden="true">
          {'04'}
        </div>
        <div className={styles['hud']}>
          <span>
            <span className={styles['sec']}>{'SECTOR 04'}</span>
            {' // TERMINAL / 004'}
          </span>
          <span className={styles['live']}>{'Deploy'}</span>
        </div>
        <div className={styles['body']}>
          <div className={styles['kicker']}>
            <em>{'04'}</em>
            <span></span>
            {'Process'}
          </div>
          <PosterHeading
            as="h2"
            id="poster-title-we-build"
            solid={'We build.\nWe fix.\n'}
            outline={'We connect.'}
          />
          <p className={styles['lede']}>
            {
              "New projects. Existing platforms. Complicated problems. Whether you're starting from scratch or trying to make an existing system work better, we can help you move forward."
            }
          </p>
          <Link
            className={styles['cta'] + ' ' + styles['solid']}
            href="/contact"
            data-studio-cta=""
          >
            {'Start a project '}
            <svg
              width="16"
              height="16"
              viewBox="0 0 48 48"
              fill="none"
              strokeWidth="4.5"
              strokeLinecap="square"
              aria-hidden="true"
            >
              <path d="M12 36L36 12M16 12H36V32"></path>
            </svg>
          </Link>
        </div>
        <div className={styles['spec']}>
          <header>
            <span>{'dash10 \u2014 zsh'}</span>
            <b>{'Live'}</b>
          </header>
          <div
            className={styles['in-body']}
            tabIndex={0}
            role="region"
            aria-label="Technical code panel"
          >
            <span className={styles['k']}>{'$'}</span>
            {' dash10 project:init\n\n'}
            <span className={styles['k']}>{'\u2713'}</span>
            {' Understand the problem\n'}
            <span className={styles['k']}>{'\u2713'}</span>
            {' Map the right architecture\n'}
            <span className={styles['k']}>{'\u2713'}</span>
            {' Build. Test. Refine.\n'}
            <span className={styles['k']}>{'\u2713'}</span>
            {' Connect the missing parts\n\n'}
            <span className={styles['k']}>{'$'}</span>
            {' dash10 deploy --production\nAll systems ready.\n'}
            <span className={styles['k']}>{'Built for what comes next.'}</span>
            <span className={styles['cur']}></span>
          </div>
        </div>
        <div className={styles['foot']}>
          <span>{'Veteran owned'}</span>
          <span>{'Milwaukee, WI'}</span>
        </div>
      </section>
    </Posters80Motion>
  )
}
