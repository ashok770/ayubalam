import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/common/LoadingSpinner";
import StatusBadge from "../components/tracking/StatusBadge";
import {
  adminDecision,
  getAdminComplaints,
  getAdminFeedbackComplaints,
} from "../services/complaintService";
import { formatDate } from "../utils/helpers";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState(null);
  const [rejectNote, setRejectNote] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [allRes, fbRes] = await Promise.all([
        getAdminComplaints(),
        getAdminFeedbackComplaints(),
      ]);
      setComplaints(allRes.data.complaints || []);
      setFeedback(fbRes.data.complaints || []);
    } catch {
      toast.error("Could not load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminDecision(id, { action: "approve" });
      toast.success("Complaint approved");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const handleReject = async (id) => {
    try {
      await adminDecision(id, {
        action: "reject",
        adminRemarks: rejectNote,
      });
      toast.success("Complaint rejected");
      setRejectId(null);
      setRejectNote("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard">
      <h2>Administrator</h2>
      <p className="muted">
        Approve complaints to send them to the worker queue, or reject with an
        optional note.
      </p>

      <section className="panel table-panel">
        <h3>All complaints</h3>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Title</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id}>
                  <td>{c.complaintId}</td>
                  <td>{c.userId?.name || "—"}</td>
                  <td>{c.title}</td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td>{formatDate(c.updatedAt)}</td>
                  <td>
                    {c.status === "Awaiting Approval" ? (
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn-small success"
                          onClick={() => handleApprove(c._id)}
                        >
                          Approve
                        </button>
                        {rejectId === c._id ? (
                          <div className="reject-inline">
                            <input
                              placeholder="Reason (optional)"
                              value={rejectNote}
                              onChange={(e) => setRejectNote(e.target.value)}
                            />
                            <button
                              type="button"
                              className="btn-small danger"
                              onClick={() => handleReject(c._id)}
                            >
                              Confirm reject
                            </button>
                            <button
                              type="button"
                              className="btn-small ghost"
                              onClick={() => {
                                setRejectId(null);
                                setRejectNote("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn-small danger"
                            onClick={() => setRejectId(c._id)}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel table-panel">
        <h3>User feedback</h3>
        {feedback.length === 0 ? (
          <p className="muted">No ratings yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>User</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((c) => (
                  <tr key={c._id}>
                    <td>{c.complaintId}</td>
                    <td>{c.userId?.name}</td>
                    <td>
                      {"★".repeat(c.feedback.rating)}
                      {"☆".repeat(5 - c.feedback.rating)}
                    </td>
                    <td>{c.feedback.comment || "—"}</td>
                    <td>{formatDate(c.feedback.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
