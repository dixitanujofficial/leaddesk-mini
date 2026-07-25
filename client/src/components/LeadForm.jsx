import { useState } from "react";
import { submitLead } from "../api/api.js";

const initialForm = { name: "", email: "", budgetRange: "", message: "" };
const emailPattern = /^\S+@\S+\.\S+$/;

const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Please tell us your name.";
  if (!form.email.trim()) errors.email = "Your email is required.";
  else if (!emailPattern.test(form.email)) errors.email = "Enter a valid email address.";
  if (!form.budgetRange) errors.budgetRange = "Select a budget range.";
  if (!form.message.trim()) errors.message = "A short project note helps.";
  return errors;
};

export default function LeadForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setServerError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    setServerError("");

    try {
      await submitLead(form);
      setForm(initialForm);
      setIsSubmitted(true);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="form-success" role="status" aria-live="polite">
        <span className="success-check">✓</span>
        <p className="eyebrow">Message received</p>
        <h2>That’s in the desk.</h2>
        <p>Thanks for reaching out. We’ll take a look and get back to you shortly.</p>
        <button className="text-button" type="button" onClick={() => setIsSubmitted(false)}>
          Send another enquiry <span>→</span>
        </button>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit} noValidate>
      <div className="form-heading">
        <p className="eyebrow">Start a conversation</p>
        <h2>Tell us what’s taking shape.</h2>
      </div>

      <div className="field-grid">
        <label className="field">
          <span>Name</span>
          <input
            name="name"
            value={form.name}
            onChange={updateField}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            placeholder="Your name"
          />
          {errors.name && <small id="name-error">{errors.name}</small>}
        </label>

        <label className="field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="you@company.com"
          />
          {errors.email && <small id="email-error">{errors.email}</small>}
        </label>
      </div>

      <label className="field">
        <span>Project budget</span>
        <select
          name="budgetRange"
          value={form.budgetRange}
          onChange={updateField}
          aria-invalid={Boolean(errors.budgetRange)}
          aria-describedby={errors.budgetRange ? "budget-error" : undefined}
        >
          <option value="">Choose a range</option>
          <option value="Under $1,000">Under $1,000</option>
          <option value="$1,000 – $5,000">$1,000 – $5,000</option>
          <option value="$5,000 – $10,000">$5,000 – $10,000</option>
          <option value="$10,000+">$10,000+</option>
        </select>
        {errors.budgetRange && <small id="budget-error">{errors.budgetRange}</small>}
      </label>

      <label className="field">
        <span>What are you working on?</span>
        <textarea
          name="message"
          value={form.message}
          onChange={updateField}
          maxLength="2000"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          placeholder="A little context goes a long way."
          rows="4"
        />
        {errors.message && <small id="message-error">{errors.message}</small>}
      </label>

      {serverError && <p className="form-error" role="alert">{serverError}</p>}

      <button className="button button--primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send project note"}
        {!isSubmitting && <span aria-hidden="true">↗</span>}
      </button>
    </form>
  );
}

