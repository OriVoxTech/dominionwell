import Image from "next/image";

export default function Home() {
  return (
    <main className="coming-soon-page">
      <div className="aura aura-left" aria-hidden="true" />
      <div className="aura aura-right" aria-hidden="true" />

      <section className="launch-shell">
        <header className="brand-row reveal">
          <Image
            src="/logo.png"
            alt="DominionWell"
            width={860}
            height={572}
            className="logo"
            priority
          />
          <p className="status-pill">Coming Soon!!!</p>
        </header>

        <div className="content-grid">
          <section className="headline-block reveal delay-1">
            <p className="eyebrow">Digital Healthcare, Reimagined</p>
            <h1>
              A healthier future is
              <span> almost here.</span>
            </h1>
            <p className="subcopy">
              DominionWell is preparing a secure and accessible healthcare
              platform to help people connect with trusted care anytime,
              anywhere.
            </p>

            <div className="feature-chips" aria-label="What to expect at launch">
              <span>Book Appointments</span>
              <span>Consult Online</span>
              <span>Secure Records</span>
              <span>Affordable Care</span>
            </div>
          </section>

          <aside className="info-panel reveal delay-2" aria-label="Launch updates">
            <h2>Launch Update</h2>
            <p>
              We are finalizing the experience and polishing every detail.
              Follow along as we prepare to go live.
            </p>

            <div className="stat-grid">
              <article>
                <p className="stat-number">24/7</p>
                <p className="stat-label">Access Focus</p>
              </article>
              <article>
                <p className="stat-number">100%</p>
                <p className="stat-label">Privacy Mindset</p>
              </article>
              <article>
                <p className="stat-number">1</p>
                <p className="stat-label">Unified Platform</p>
              </article>
            </div>

            <p className="foot-note">Your Health. Our Priority</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
