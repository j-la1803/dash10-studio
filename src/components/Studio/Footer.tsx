import Image from 'next/image'
import Link from 'next/link'
import { Beer } from 'lucide-react'

export function StudioFooter() {
  return (
    <footer className="studio-footer">
      <Image
        unoptimized
        width={905}
        height={620}
        className="footer-monogram"
        src="/brand/logo/dash10-monogram-white-unboxed.svg"
        alt=""
        aria-hidden="true"
      />
      <div className="footer-columns">
        <div className="footer-studio">
          <Link href="/" aria-label="Dash 10 Studio home">
            <Image
              unoptimized
              src="/brand/logo/dash10-wordmark-white.svg"
              width={180}
              height={65}
              alt="Dash 10"
            />
          </Link>
          <p>
            Web development, e-commerce and digital systems for businesses that need more than
            templates.
          </p>
          <Link className="studio-cta" href="/contact">
            LET’S TALK <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <nav aria-label="Footer services">
          <p className="studio-label">SERVICES</p>
          <Link href="/services#web-development">Web Development</Link>
          <Link href="/services#ecommerce">E-Commerce</Link>
          <Link href="/services#integrations">Integrations</Link>
          <Link href="/services#support">Technical Support</Link>
        </nav>
        <nav aria-label="Footer company">
          <p className="studio-label">COMPANY</p>
          <Link href="/about">About</Link>
          <Link href="/process">Process</Link>
          <Link href="/posts">Blog</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="footer-contact">
          <p className="studio-label">BASED IN</p>
          <p className="footer-location">
            <Beer size={16} strokeWidth={1.5} aria-hidden="true" /> MILWAUKEE, WI
          </p>
          <p className="footer-coordinates">43.0389° N / 87.9065° W</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Dash 10 Studio. All rights reserved.</span>
        <nav className="footer-utilities" aria-label="Footer utilities">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="/sitemap.xml">Sitemap</a>
          <span id="footer-analytics-preferences" />
        </nav>
      </div>
    </footer>
  )
}
