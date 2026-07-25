import Brand from "../components/Brand.jsx";
import Footer from "../components/Footer.jsx";
import LeadForm from "../components/LeadForm.jsx";

export default function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-intro">
        <nav className="landing-nav">
          <Brand />
          <a className="admin-link" href="/admin/login">Admin <span>↗</span></a>
        </nav>

        <div className="intro-content">
          <p className="eyebrow eyebrow--light">For ideas with intent</p>
          <h1>Good work starts with a clear <i>hello.</i></h1>
          <p className="intro-copy">
            LeadDesk gives your next project a thoughtful first step — no noise, just the useful details.
          </p>
        </div>

        <div className="intro-footer-note">
          <span className="pulse-dot" />
          Open for new conversations
        </div>
      </section>

      <section className="form-panel">
        <LeadForm />
        <Footer />
      </section>
    </main>
  );
}

