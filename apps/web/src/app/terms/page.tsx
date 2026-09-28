import LegalPage from '../LegalPage'

export const metadata = { title: 'Terms — Skills Manager' }

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms for using Skills Manager." updated="September 28, 2026">
      <section>
        <h2>Using the software</h2>
        <p>Skills Manager is open-source software for discovering and managing AI agent skills. By downloading or using it, you agree to these terms and to use the software lawfully.</p>
      </section>
      <section>
        <h2>Open-source license</h2>
        <p>The source code is provided under the license included in the <a href="https://github.com/zunalabs/skills-manager">repository</a>. That license governs your rights to copy, modify, and distribute the code. These terms govern the website, downloads, feedback, and other services around the project.</p>
      </section>
      <section>
        <h2>Your files and third-party skills</h2>
        <p>You remain responsible for your files, backups, and the skills you choose to install, copy, edit, or remove. Community skills and linked repositories are provided by third parties. Review their contents and licenses before using them.</p>
      </section>
      <section>
        <h2>No guarantee</h2>
        <p>The software and services are provided as available, without warranties to the extent permitted by law. We do not promise uninterrupted operation, compatibility with every agent, or that third-party skills are safe or suitable for a particular purpose.</p>
      </section>
      <section>
        <h2>Limitation of liability</h2>
        <p>To the extent permitted by law, the project and its maintainers are not liable for indirect, incidental, or consequential loss arising from use of the software, including lost files, lost profits, or third-party claims.</p>
      </section>
      <section>
        <h2>Sponsorship</h2>
        <p>Sponsorship is voluntary support for continued open-source development. It does not purchase ownership, control over the roadmap, or guaranteed support unless a sponsorship tier explicitly says otherwise.</p>
      </section>
      <section>
        <h2>Changes and availability</h2>
        <p>We may update, suspend, or discontinue features and may revise these terms as the project develops. Continued use after an update means you accept the revised terms.</p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>Questions can be sent through the website feedback form or raised in the <a href="https://github.com/zunalabs/skills-manager">GitHub repository</a>.</p>
      </section>
    </LegalPage>
  )
}
