import { TechnologyMarquee } from './TechnologyMarquee'
import Image from 'next/image'
import { Posters80 } from './Posters80'
import { Capabilities } from './Capabilities'
import { VideoHero } from '@/components/VideoHero'

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

export function StudioHome() {
  return (
    <main id="main-content" className="dash-home">
      <VideoHero
        eyebrow="DIGITAL DEVELOPMENT STUDIO"
        lines={['THE RIGHT', 'TECHNOLOGY.', 'BUILT THE', 'RIGHT WAY.']}
        video="/videos/dash-10-video-bg-faststart.mp4"
        playbackRate={0.3}
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
      <Posters80 />
      <Capabilities />
    </main>
  )
}
