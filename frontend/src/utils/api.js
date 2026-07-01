import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("evoting_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("evoting_token");
      localStorage.removeItem("evoting_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  registerFace: (data) => API.post("/auth/register-face", data),
  verifyFace: (data) => API.post("/auth/verify-face", data),
  getMe: () => API.get("/auth/me"),
};

export const electionAPI = {
  getAll: () => API.get("/elections"),
  getById: (id) => API.get(`/elections/${id}`),
  getResults: (id) => API.get(`/elections/${id}/results`),
};

export const voteAPI = {
  castVote: (data) => API.post("/votes/cast", data),
  getMyVotes: () => API.get("/votes/my-votes"),
  verifyReceipt: (token) => API.get(`/votes/verify/${token}`),
};

export const adminAPI = {
  getDashboard: () => API.get("/admin/dashboard"),
  getVoters: (params) => API.get("/admin/voters", { params }),
  seedElection: () => API.post("/admin/seed-election"),
  toggleVoter: (id) => API.put(`/admin/voters/${id}/toggle`),
  createElection: (data) => API.post("/admin/create-election", data),
};

export default API;
