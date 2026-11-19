import { LegalPage } from '@/components/Studio/LegalPage'
import { siteMetadata } from '@/utilities/siteMetadata'

export const metadata = siteMetadata(
  '/privacy',
  'Privacy Policy | Dash 10 Studio',
  'How Dash 10 Studio handles project inquiries, website information, optional analytics and privacy requests.',
)

export default function Page() {
  return (
    <LegalPage title="Privacy Policy" effectiveDate="2026-11-19">
      <p>
        Dash 10 Studio operates dash10studio.com. This policy explains how information is handled
        when you visit this website or contact us through it. It applies to this website; a client
        project may have separate terms and data-handling arrangements.
      </p>
      <h2>Information you choose to provide</h2>
      <p>
        Our Contact form asks for your name, email address, selected service and project details,
        with optional company or agency and website fields. We use that information to understand
        your request, respond to you, discuss potential work and keep a record of the conversation.
        Please do not submit passwords, payment details or sensitive personal information that is
        unnecessary for an initial inquiry.
      </p>
      <p>
        Inquiries are stored in our Payload content management system (CMS), using a Supabase
        PostgreSQL database. Authorized CMS users can access them; the website does not make inquiry
        records available through its public collection API. Form validation, an anti-spam field and
        submission rate limits help limit invalid or repeated requests. A daily pseudonymous key
        derived from the hosting-provided IP address supports rate limiting; the inquiry record does
        not store the raw IP address.
      </p>
      <p>
        A successful submission means the inquiry has been saved. We use Resend to send the
        submitted fields to our designated notification inboxes so we can respond. Notification
        delivery can fail independently of saved inquiry storage. If you contact us directly by
        email, we use the message and contact details to handle your correspondence through our
        email service.
      </p>
      <h2>Information involved in operating the website</h2>
      <p>
        When your browser requests a page or file, our hosting provider, Vercel, processes technical
        information needed to deliver and protect the website. This can include an IP address,
        requested URL, browser and device information, request times and diagnostic or security
        information. Operational processing is separate from optional analytics and is necessary to
        serve website requests.
      </p>
      <h2>Cookies, browser storage and optional analytics</h2>
      <p>
        The website stores your analytics choice in your browser’s local storage so it can remember
        whether you allowed or declined analytics. It may also store a presentation preference.
        These preferences are separate from measurement cookies. Administrative sign-in and
        draft-preview features use cookies for authorized editors.
      </p>
      <p>
        Google Tag Manager loads only after you choose <strong>Allow analytics</strong>. If you
        decline or make no choice, the website does not load that container. When it loads, your
        browser connects to Google, which receives technical request information, including your IP
        address and browser information, to provide the service.
      </p>
      <p>
        After consent, the website prepares measurement events for page views, selected calls to
        action and confirmed contact-form success. Those application-controlled events do not
        include your name, email address, project message or submitted form values. Page paths are
        limited to predefined categories and exclude URL query strings.
      </p>
      <p>
        As of this policy’s effective date, Google Tag Manager is installed, but Google Analytics 4
        is not active in its published container. Our production check did not observe GA4
        measurement requests or analytics cookies. We do not describe an unpublished GA4
        configuration as active collection. We will update this policy if the website’s measurement
        practices change.
      </p>
      <p>
        You can reopen <strong>Analytics preferences</strong> in the footer at any time. Choosing
        Decline analytics stops future container loading; if it was already loaded, the site sends a
        denied-consent update, attempts to remove accessible first-party Google Analytics cookies
        and reloads. This does not erase information already processed by a provider. Clearing
        browser storage can also reset your saved choice. The Contact form works whether you allow
        or decline analytics.
      </p>
      <p>
        Google explains its handling of service data in{' '}
        <a href="https://policies.google.com/technologies/partner-sites">
          How Google uses information from sites or apps that use its services
        </a>{' '}
        and its <a href="https://policies.google.com/privacy">Privacy Policy</a>.
      </p>
      <h2>Service providers and disclosures</h2>
      <p>Our current website uses the following services:</p>
      <ul>
        <li>
          <strong>Vercel:</strong> website hosting, delivery and related operational processing.
        </li>
        <li>
          <strong>Supabase:</strong> database hosting for CMS content and saved inquiries.
        </li>
        <li>
          <strong>Payload:</strong> the CMS software through which we manage content and inquiries.
        </li>
        <li>
          <strong>Resend:</strong> transactional delivery of contact inquiry notifications,
          including the submitted fields.
        </li>
        <li>
          <strong>Google Tag Manager:</strong> optional tag management, loaded after analytics
          consent.
        </li>
      </ul>
      <p>
        HubSpot is not currently enabled on the public Contact form and does not receive inquiries
        through that form. The presence of a prepared integration in our software does not mean the
        service is active.
      </p>
      <p>
        Information is handled by the providers involved in delivering these functions. We may also
        disclose information when required by law, to respond to a valid legal request, or when
        reasonably necessary to protect people, our rights or the security of the website. Following
        an external link shares information with the destination under its own privacy practices.
        Providers may process information in locations other than where you live; this policy does
        not promise a particular storage region or local-only processing.
      </p>
      <h2>Data security</h2>
      <p>
        We use measures such as HTTPS, authenticated CMS access, restricted access to inquiry
        records and server-side form validation to help protect information. No website,
        transmission method or storage system is completely secure, and we cannot guarantee that
        unauthorized access, loss or misuse will never occur.
      </p>
      <h2>Retention</h2>
      <p>
        The website does not currently apply a fixed automatic deletion period to contact inquiries.
        Records remain in the CMS until removed. Hosting logs, provider records and backups are
        handled separately and can have different retention arrangements. We do not promise that
        removing an active record immediately removes every backup copy or information previously
        processed by another provider.
      </p>
      <h2>Requests concerning your information</h2>
      <p>
        You may contact us to ask about information you submitted, request a correction or ask for
        deletion. Include enough context to help us locate the inquiry, without sending unnecessary
        sensitive information. We may need to verify that a request relates to your information. We
        will consider requests in light of applicable requirements and any need to retain
        information for legal or operational reasons. This policy does not limit rights you may have
        under applicable law.
      </p>
      <h2>External websites</h2>
      <p>
        This website may link to third-party websites. We do not operate those sites, and their
        information practices are governed by their own policies. Review the destination’s policy
        before providing personal information.
      </p>
      <h2>Policy updates</h2>
      <p>
        We may update this policy when the website or its information practices change. The revised
        policy will be posted here with an updated effective date. Please review this page
        periodically for the current version.
      </p>
      <h2>Contact</h2>
      <p>
        For privacy questions or requests, email Dash 10 Studio at{' '}
        <a href="mailto:justin@dash10.studio">justin@dash10.studio</a>.
      </p>
    </LegalPage>
  )
}
