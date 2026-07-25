import { Link } from "react-router-dom";

export default function Brand({ compact = false }) {
  return (
    <Link className={`brand ${compact ? "brand--compact" : ""}`} to="/" aria-label="LeadDesk Mini home">
      <span className="brand-mark">L</span>
      <span>LeadDesk<em>Mini</em></span>
    </Link>
  );
}

