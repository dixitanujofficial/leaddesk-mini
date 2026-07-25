const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const { headers: customHeaders, ...restOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || "Something went wrong. Please try again.",
    );
    error.status = response.status;
    throw error;
  }

  return data;
};

export const submitLead = (lead) =>
  request("/leads", {
    method: "POST",
    body: JSON.stringify(lead),
  });

export const login = (credentials) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

export const fetchLeads = (token, search = "") => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return request(`/leads${query}`, { headers: authHeaders(token) });
};

export const changeLeadStatus = (token, id, status) =>
  request(`/leads/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });

