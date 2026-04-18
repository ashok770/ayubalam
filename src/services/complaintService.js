import api from "./api";

export function createComplaint(payload) {
  return api.post("/complaints", payload);
}

export function trackComplaint(complaintId) {
  return api.get(`/complaints/track/${encodeURIComponent(complaintId)}`);
}

export function getMyComplaints() {
  return api.get("/complaints/mine");
}

export function getMyComplaint(id) {
  return api.get(`/complaints/mine/${id}`);
}

export function updateMyComplaint(id, payload) {
  return api.patch(`/complaints/mine/${id}`, payload);
}

export function deleteMyComplaint(id) {
  return api.delete(`/complaints/mine/${id}`);
}

export function submitFeedback(id, payload) {
  return api.post(`/complaints/mine/${id}/feedback`, payload);
}

export function getAdminComplaints() {
  return api.get("/complaints/admin/all");
}

export function getAdminFeedbackComplaints() {
  return api.get("/complaints/admin/feedback");
}

export function adminDecision(id, payload) {
  return api.patch(`/complaints/admin/${id}/decision`, payload);
}

export function getWorkerQueue() {
  return api.get("/complaints/worker/queue");
}

export function updateWorkerStatus(id, payload) {
  return api.patch(`/complaints/worker/${id}/status`, payload);
}
