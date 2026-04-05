const BASE = process.env.REACT_APP_BASE_URL;

// -------------------------
// COMMON HANDLER
// -------------------------
const handle = async (res) => {
  if (!res.ok) {
    let err = {};
    try {
      err = await res.json();
    } catch {}
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
};

// -------------------------
// GENERIC REQUEST WRAPPER
// -------------------------
const request = (url, options = {}) =>
  fetch(`${BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  }).then(handle);

// -------------------------
// TICKETS
// -------------------------
export const getTickets = () =>
  request("/tickets");

// ✅ FIXED: sends JSON body instead of query param
export const createTicket = (description) =>
  request("/ticket", {
    method: "POST",
    body: JSON.stringify({ description }),
  });

// -------------------------
// STATUS UPDATE
// -------------------------
export const updateStatus = (id, status, user = "agent") =>
  request(
    `/ticket/${id}/status?status=${encodeURIComponent(status)}&user=${user}`,
    { method: "PUT" }
  );

// -------------------------
// REQUEST MORE INFO
// -------------------------
export const requestInfo = (id, message, user = "agent") =>
  request(
    `/ticket/${id}/request-info?message=${encodeURIComponent(message)}&user=${user}`,
    { method: "PUT" }
  );

// -------------------------
// NOTES
// -------------------------
export const addNote = (id, note, user = "agent") =>
  request(
    `/ticket/${id}/notes?note=${encodeURIComponent(note)}&user=${user}`,
    { method: "POST" }
  );

// -------------------------
// HISTORY
// -------------------------
export const getHistory = (id) =>
  request(`/ticket/${id}/history`);

// -------------------------
// SEARCH / FILTER
// -------------------------
export const searchTickets = (params) => {
  const query = new URLSearchParams(params).toString();
  return request(`/tickets/search?${query}`);
};

// -------------------------
// ANALYTICS
// -------------------------
export const getAnalytics = () =>
  request("/analytics");

// -------------------------
// EMPLOYEES
// -------------------------
export const getEmployees = async () => {
  return await request("/employees");
};