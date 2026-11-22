import Link from 'next/link'
import { DesignPage } from '@/components/Replacement/Template'
import { siteMetadata } from '@/utilities/siteMetadata'

export const metadata = siteMetadata(
  '/terms',
  'Website Terms of Use | Dash 10 Studio',
  'Terms for using the Dash 10 Studio website, including permitted use, website content and project inquiries.',
)

export default function Page() {
  return (
    <DesignPage
      page="terms"
      legal={
        <>
          <p>
            Effective date: <time dateTime="2026-11-18">November 18, 2026</time>
          </p>
          <p>
            These terms describe the permitted use of dash10studio.com, operated by Dash 10 Studio.
            The website presents our development services and publishes general information about
            websites, e-commerce and connected systems. Please use it consistently with these terms
            and applicable law.
          </p>
          <h2>Permitted use</h2>
          <p>
            You may browse public pages, follow links and submit genuine project inquiries. Do not
            attempt to access private CMS content or other information without authorization,
            interfere with the website’s operation, introduce malicious code, misuse the contact
            form or submit fraudulent, unlawful or abusive material. Do not include passwords or
            unnecessary sensitive personal information in an inquiry.
          </p>
          <h2>Website content and intellectual property</h2>
          <p>
            Dash 10 Studio branding, writing, designs and other original website materials are
            protected by applicable intellectual-property laws. Third-party names, logos, software,
            images and other materials remain subject to their respective owners’ rights and
            applicable licenses. Nothing on this website transfers ownership of those materials.
          </p>
          <p>
            You may link to public pages and use material as permitted by applicable law or an
            express license. Other reuse of protected content or branding requires permission from
            the relevant rights holder. Technology names and logos identify tools and platforms;
            they do not imply an official partnership, sponsorship or endorsement.
          </p>
          <h2>Information, accuracy and availability</h2>
          <p>
            Website articles and descriptions provide general information, rather than advice
            tailored to your circumstances. Technologies, vendor offerings and requirements can
            change. Although we aim to provide useful, accurate information, we do not guarantee
            that every page is complete, current or free from errors. Evaluate information against
            your own needs before relying on it.
          </p>
          <p>
            We may update or remove content, change website features or temporarily interrupt access
            for maintenance or other reasons. We do not guarantee uninterrupted availability or that
            the website will meet every visitor’s requirements.
          </p>
          <h2>Project inquiries and service agreements</h2>
          <p>
            Visiting this website, reading an article or submitting the Contact form does not by
            itself create a consulting, development or other service agreement. An inquiry is an
            invitation to discuss potential work, not an accepted project, quote or commitment to a
            scope, price, timeline or result. Any engagement and its obligations must be agreed
            separately by the parties. These website terms do not replace a separate service
            agreement.
          </p>
          <h2>External links</h2>
          <p>
            Links to third-party websites are provided for relevant information or convenience. We
            do not control those websites or guarantee their content, availability, products or
            services. Your use of an external website is subject to its own terms and privacy
            practices.
          </p>
          <h2>Limitations</h2>
          <p>
            To the extent permitted by applicable law, the website and its general information are
            provided as available, without a promise that they are suitable for a particular
            purpose. Dash 10 Studio is not responsible for indirect or consequential losses arising
            from use of, or inability to use, this informational website, including lost profits or
            business opportunities, to the extent such a limitation is legally permitted.
          </p>
          <p>
            Nothing in these terms excludes or limits responsibility that cannot lawfully be
            excluded or limited, or removes protections you have under applicable law. Obligations
            for paid project work are governed by the applicable service agreement, not by this
            general website limitation.
          </p>
          <h2>Privacy</h2>
          <p>
            Our <Link href="/privacy">Privacy Policy</Link> explains the website’s contact-form
            storage, service providers, optional analytics and privacy-request contact information.
          </p>
          <h2>Changes to these terms</h2>
          <p>
            We may revise these terms as the website changes. The current version will be posted on
            this page with its effective date. Please review it periodically. Changes to these
            website terms do not, by themselves, amend a separate project agreement.
          </p>
          <h2>Contact</h2>
          <p>
            Questions about these terms may be sent to Dash 10 Studio at{' '}
            <a href="mailto:info@dash10studio.com">info@dash10studio.com</a>.
          </p>
        </>
      }
    />
  )
}
