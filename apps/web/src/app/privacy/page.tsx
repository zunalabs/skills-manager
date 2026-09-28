import LegalPage from '../LegalPage'

export const metadata = { title: 'Privacy — Skills Manager' }

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy, in plain language." updated="September 28, 2026">
      <section>
        <h2>The short version</h2>
        <p>Skills Manager is built to work locally. We do not sell personal information, run ads, or read the contents of your skills for analytics. The desktop app sends restricted anonymous usage events.</p>
      </section>
      <section>
        <h2>What the desktop app accesses</h2>
        <p>The app reads and manages the skill folders you choose to use on your computer. This processing happens locally. When you install or discover a skill, the app connects directly to GitHub or the displayed catalog provider.</p>
        <p className="mt-3">If you add a GitHub token, it is stored in the app’s local configuration on your device and is used only for requests to GitHub. It is not sent to Skills Manager’s website.</p>
      </section>
      <section>
        <h2>Feedback</h2>
        <p>When you send feedback, we receive your message, feedback type, optional rating, optional email address, app version, and operating system. We do not attach skill names, file paths, repository URLs, or tokens. Feedback is delivered through our website and private Discord workspace so we can review and respond to it.</p>
      </section>
      <section>
        <h2>Website analytics</h2>
        <p>The website uses Vercel Web Analytics for aggregate traffic information such as page views, referrers, approximate region, browser, and device type. Vercel Analytics does not use third-party cookies and does not give us a profile that identifies you across websites.</p>
        <p className="mt-3">When you use a download button, we record the selected operating system and the country code supplied by our hosting provider. The event is delivered to our private Discord workspace. We do not include the download request’s IP address, browser string, email, or a persistent user identifier in that event.</p>
      </section>
      <section>
        <h2>Desktop analytics</h2>
        <p>We use Aptabase to measure anonymous events such as opening the app, completing a scan, opening Discover, install and copy outcomes, and submitting feedback. Aptabase also attaches general system information such as app version, operating system, and locale.</p>
        <p className="mt-3">Desktop analytics never include skill names or contents, file paths, repository URLs, GitHub tokens, feedback text, email addresses, IP addresses, or a persistent device identifier.</p>
      </section>
      <section>
        <h2>Service providers</h2>
        <p>We use GitHub for source code and releases, Vercel to host the website and provide aggregate web analytics, Discord to receive feedback and download events, and Aptabase for anonymous desktop usage analytics. Their own privacy terms apply when their services process information.</p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>You can use the desktop app without creating an account and without submitting feedback. If you included an email in feedback and want the message removed, contact us through the website feedback form or the <a href="https://github.com/zunalabs/skills-manager">GitHub repository</a>.</p>
      </section>
      <section>
        <h2>Changes</h2>
        <p>We may update this notice when the product or its providers change. The date at the top shows the latest revision.</p>
      </section>
    </LegalPage>
  )
}
