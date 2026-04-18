import React, { useState } from "react";
import { toast } from "react-toastify";
import { trackComplaint } from "../../services/complaintService";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../../utils/helpers";

function statusColor(status) {
  switch (status) {
    case "Awaiting Approval":
      return "#f39c12";
    case "Pending":
      return "#8e44ad";
    case "In Progress":
      return "#3498db";
    case "Completed":
      return "#27ae60";
    case "Rejected":
      return "#e74c3c";
    default:
      return "#7f8c8d";
  }
}

export default function TrackComplaint() {
  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const id = complaintId.trim();
    if (!id) {
      toast.error("Enter a complaint ID");
      return;
    }
    setLoading(true);
    setComplaint(null);
    try {
      const { data } = await trackComplaint(id);
      setComplaint(data.complaint);
    } catch (err) {
      const msg = err.response?.data?.message || "Complaint not found";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel track-panel">
      <h2>Track a complaint</h2>
      <p className="muted">
        Enter the complaint reference you received after submission (for example,
        CMP173…).
      </p>
      <form onSubmit={handleSearch} className="track-form">
        <input
          type="text"
          placeholder="Complaint ID"
          value={complaintId}
          onChange={(e) => setComplaintId(e.target.value)}
        />
        <button type="submit" className="btn-primary-solid" disabled={loading}>
          {loading ? "Searching…" : "Track"}
        </button>
      </form>

      {complaint && (
        <div className="track-result">
          <h3>Details</h3>
          <div className="detail-grid">
            <div>
              <span className="muted">Reference</span>
              <p>{complaint.complaintId}</p>
            </div>
            <div>
              <span className="muted">Title</span>
              <p>{complaint.title}</p>
            </div>
            <div>
              <span className="muted">Category</span>
              <p>{complaint.category}</p>
            </div>
            <div>
              <span className="muted">Status</span>
              <p>
                <StatusBadge status={complaint.status} />
              </p>
            </div>
            <div>
              <span className="muted">Submitted</span>
              <p>{formatDate(complaint.createdAt)}</p>
            </div>
            <div>
              <span className="muted">Last update</span>
              <p>{formatDate(complaint.updatedAt)}</p>
            </div>
          </div>
          <p>
            <span className="muted">Description</span>
            <br />
            {complaint.description}
          </p>
          {complaint.remarks && (
            <p>
              <span className="muted">Worker notes</span>
              <br />
              {complaint.remarks}
            </p>
          )}
          {complaint.adminRemarks && (
            <p>
              <span className="muted">Admin message</span>
              <br />
              {complaint.adminRemarks}
            </p>
          )}
          {complaint.feedback?.rating && (
            <p>
              <span className="muted">User rating</span>
              <br />
              <span style={{ color: statusColor("Completed") }}>
                {"★".repeat(complaint.feedback.rating)}
                {"☆".repeat(5 - complaint.feedback.rating)}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
