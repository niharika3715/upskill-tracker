import axios from "axios";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const api = {
  pace: () => axios.get(`${API}/pace`).then((r) => r.data),
  ownership: () => axios.get(`${API}/ownership`).then((r) => r.data),
  updateOwnership: (id, body) => axios.patch(`${API}/ownership/${id}`, body).then((r) => r.data),
  streak: () => axios.get(`${API}/streak`).then((r) => r.data),
  stats: () => axios.get(`${API}/stats`).then((r) => r.data),
  problems: () => axios.get(`${API}/problems`).then((r) => r.data),
  updateProblem: (id, body) => axios.patch(`${API}/problems/${id}`, body).then((r) => r.data),
  videos: () => axios.get(`${API}/videos`).then((r) => r.data),
  updateVideo: (id, body) => axios.patch(`${API}/videos/${id}`, body).then((r) => r.data),
  resources: () => axios.get(`${API}/resources`).then((r) => r.data),
  createResource: (body) => axios.post(`${API}/resources`, body).then((r) => r.data),
  deleteResource: (id) => axios.delete(`${API}/resources/${id}`).then((r) => r.data),
  updateResource: (id, body) => axios.patch(`${API}/resources/${id}`, body).then((r) => r.data),
  mocks: () => axios.get(`${API}/mocks`).then((r) => r.data),
  createMock: (body) => axios.post(`${API}/mocks`, body).then((r) => r.data),
  updateMock: (id, body) => axios.patch(`${API}/mocks/${id}`, body).then((r) => r.data),
  deleteMock: (id) => axios.delete(`${API}/mocks/${id}`).then((r) => r.data),
  sessions: () => axios.get(`${API}/sessions`).then((r) => r.data),
  createSession: (body) => axios.post(`${API}/sessions`, body).then((r) => r.data),
  updateSession: (id, body) => axios.patch(`${API}/sessions/${id}`, body).then((r) => r.data),
  startSession: (id) => axios.post(`${API}/sessions/${id}/start`).then((r) => r.data),
  deleteSession: (id) => axios.delete(`${API}/sessions/${id}`).then((r) => r.data),
  reflections: () => axios.get(`${API}/reflections`).then((r) => r.data),
  saveReflection: (body) => axios.put(`${API}/reflections/today`, body).then((r) => r.data),
  settings: () => axios.get(`${API}/settings`).then((r) => r.data),
  saveSettings: (body) => axios.put(`${API}/settings`, body).then((r) => r.data),
};

export const STATUS = {
  "Solved": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Solving": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Revise": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Not Started": "bg-slate-500/10 text-slate-400 border-slate-600/30",
  "Watched": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "In Progress": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Done": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Planned": "bg-slate-500/10 text-slate-400 border-slate-600/30",
  "Scheduled": "bg-violet-500/15 text-violet-400 border-violet-500/30",
};

export const DIFF = {
  Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Hard: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export const PROBLEM_STATUSES = ["Not Started", "Solving", "Solved", "Revise"];
export const VIDEO_STATUSES = ["Not Started", "In Progress", "Watched"];
export const RESOURCE_STATUSES = ["Not Started", "In Progress", "Done"];
export const MOCK_STATUSES = ["Planned", "Scheduled", "Done"];
export const SESSION_CATEGORIES = ["DSA", "System Design", "Mock", "Revision"];
