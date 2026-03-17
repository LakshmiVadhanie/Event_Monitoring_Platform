import axios from "axios";

const BASE_URL = process.env.REACT_APP_REST_URL || "http://localhost:4000/api";

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export const eventsApi = {
  getAll: (params) => api.get("/events", { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post("/events", data),
  updateStatus: (id, status) => api.patch(`/events/${id}/status`, { status }),
  delete: (id) => api.delete(`/events/${id}`),
};

export const alertsApi = {
  getAll: (params) => api.get("/alerts", { params }),
  create: (data) => api.post("/alerts", data),
  resolve: (id) => api.patch(`/alerts/${id}/resolve`),
};

export const metricsApi = {
  getSummary: () => api.get("/metrics/summary"),
  getBySeverity: () => api.get("/metrics/by-severity"),
  getByService: () => api.get("/metrics/by-service"),
};

export default api;
