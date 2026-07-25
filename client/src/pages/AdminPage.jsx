import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { changeLeadStatus, fetchLeads } from "../api/api.js";
import Brand from "../components/Brand.jsx";
import Footer from "../components/Footer.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const statuses = ["New", "Contacted", "Closed"];
const formatDate = (value) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

export default function AdminPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const logout = () => {
    localStorage.removeItem("leaddesk_token");
    localStorage.removeItem("leaddesk_admin");
    navigate("/admin/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("leaddesk_token");
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchLeads(token, search);
        setLeads(data.leads);
      } catch (requestError) {
        if (requestError.status === 401) {
          logout();
          return;
        }
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  const updateStatus = async (lead, status) => {
    const token = localStorage.getItem("leaddesk_token");
    setUpdatingId(lead._id);
    setError("");

    try {
      const data = await changeLeadStatus(token, lead._id, status);
      setLeads((current) => current.map((item) => (item._id === lead._id ? data.lead : item)));
    } catch (requestError) {
      if (requestError.status === 401) {
        logout();
        return;
      }
      setError(requestError.message);
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <Brand compact />
        <div className="admin-actions">
          <span className="workspace-label">Admin workspace</span>
          <button className="logout-button" onClick={logout}>Log out</button>
        </div>
      </header>

      <section className="admin-main">
        <div className="dashboard-topline">
          <div>
            <p className="eyebrow">Incoming enquiries</p>
            <h1>Lead pipeline</h1>
          </div>
          <div className="lead-count"><strong>{leads.length}</strong> visible {leads.length === 1 ? "lead" : "leads"}</div>
        </div>

        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email" aria-label="Search leads by name or email" />
          {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search">×</button>}
        </label>

        {error && <p className="dashboard-error" role="alert">{error}</p>}

        <div className="table-shell">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Project note</th>
                <th>Budget</th>
                <th>Received</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="table-message">Loading the pipeline…</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan="5" className="table-message">{search ? "No leads match that search." : "No leads have arrived yet."}</td></tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id}>
                    <td data-label="Contact"><strong>{lead.name}</strong><span>{lead.email}</span></td>
                    <td data-label="Project note" className="lead-message">{lead.message}</td>
                    <td data-label="Budget">{lead.budgetRange}</td>
                    <td data-label="Received">{formatDate(lead.createdAt)}</td>
                    <td data-label="Status">
                      <div className="status-control">
                        <StatusBadge status={lead.status} />
                        <select value={lead.status} disabled={updatingId === lead._id} onChange={(event) => updateStatus(lead, event.target.value)} aria-label={`Change status for ${lead.name}`}>
                          {statuses.map((status) => <option key={status}>{status}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      <Footer />
    </main>
  );
}

