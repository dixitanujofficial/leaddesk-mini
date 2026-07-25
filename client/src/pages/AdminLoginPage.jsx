import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/api.js";
import Brand from "../components/Brand.jsx";
import Footer from "../components/Footer.jsx";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("leaddesk_token");

  if (token) return <Navigate to="/admin" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await login({ email, password });
      localStorage.setItem("leaddesk_token", data.token);
      localStorage.setItem("leaddesk_admin", JSON.stringify(data.admin));
      navigate(location.state?.from?.pathname || "/admin", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-rail">
        <Brand />
        <div>
          <p className="eyebrow eyebrow--light">LeadDesk workspace</p>
          <h1>Keep the good conversations moving.</h1>
        </div>
        <p className="rail-caption">A calm place to review, sort, and follow up on every lead.</p>
      </div>

      <section className="auth-content">
        <div className="login-box">
          <p className="eyebrow">Private access</p>
          <h2>Welcome back.</h2>
          <p className="login-copy">Sign in to manage incoming project enquiries.</p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span>Email</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="admin@company.com" />
            </label>
            <label className="field">
              <span>Password</span>
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" placeholder="••••••••" />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button--primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Enter workspace"} {!isSubmitting && <span>→</span>}
            </button>
          </form>
        </div>
        <Footer />
      </section>
    </main>
  );
}

