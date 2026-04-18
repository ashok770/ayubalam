import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/common/LoadingSpinner";
import StatusBadge from "../components/tracking/StatusBadge";
import {
  deleteMyComplaint,
  getMyComplaint,
  submitFeedback,
  updateMyComplaint,
} from "../services/complaintService";
import { formatDate } from "../utils/helpers";

const categories = ["Technical", "Billing", "Product", "Delivery", "Other"];

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [editErrors, setEditErrors] = useState({});

  const loadComplaint = useCallback(async () => {
    const { data } = await getMyComplaint(id);
    setComplaint(data.complaint);
    setEditForm({
      title: data.complaint.title || "",
      category: data.complaint.category || "",
      description: data.complaint.description || "",
      contactEmail: data.complaint.contactEmail || "",
      contactPhone: data.complaint.contactPhone || "",
    });
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        await loadComplaint();
      } catch {
        if (!cancelled) {
          setComplaint(null);
          toast.error("Complaint not found");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadComplaint]);

  const handleFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await submitFeedback(id, { rating, comment });
      setComplaint(data.complaint);
      toast.success("Feedback saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const canMutate =
    complaint &&
    ["Awaiting Approval", "Rejected"].includes(complaint.status);

  const validateEdit = () => {
    const next = {};
    if (!editForm.title.trim()) next.title = "Title is required";
    if (!editForm.category) next.category = "Select a category";
    if (!editForm.description.trim()) next.description = "Description is required";
    if (!editForm.contactEmail.trim()) {
      next.contactEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.contactEmail.trim())) {
      next.contactEmail = "Enter a valid email";
    }
    setEditErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    if (!validateEdit()) return;
    setSubmitting(true);
    const wasRejected = complaint?.status === "Rejected";
    try {
      const { data } = await updateMyComplaint(id, {
        title: editForm.title.trim(),
        category: editForm.category,
        description: editForm.description.trim(),
        contactEmail: editForm.contactEmail.trim(),
        contactPhone: editForm.contactPhone.trim(),
      });
      setComplaint(data.complaint);
      setEditing(false);
      toast.success(
        wasRejected
          ? "Updated and sent back for admin review"
          : "Complaint updated",
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Delete this complaint permanently? This cannot be undone.",
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await deleteMyComplaint(id);
      toast.success("Complaint deleted");
      navigate("/dashboard/user", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete complaint");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!complaint) {
    return (
      <p>
        Missing complaint. <Link to="/dashboard/user">Back to list</Link>
      </p>
    );
  }

  const canRate =
    complaint.status === "Completed" && !complaint.feedback?.rating;

  return (
    <div className="dashboard">
      <Link to="/dashboard/user" className="muted">
        ← Back to my complaints
      </Link>
      <header className="detail-header">
        <div>
          <h2>{complaint.title}</h2>
          <p className="muted">Reference {complaint.complaintId}</p>
        </div>
        <div className="detail-header-actions">
          <StatusBadge status={complaint.status} />
          {canMutate && (
            <div className="detail-toolbar">
              {!editing && (
                <>
                  <button
                    type="button"
                    className="btn-small primary"
                    onClick={() => setEditing(true)}
                    disabled={submitting}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-small danger"
                    onClick={handleDelete}
                    disabled={submitting}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {canMutate && editing && (
        <form className="panel stack-form" onSubmit={handleUpdateComplaint}>
          <h3>Edit complaint</h3>
          <p className="muted">
            You can change details while the ticket is waiting for approval or
            after a rejection. Saving after a rejection sends it back to the admin
            queue.
          </p>
          <div className="form-group">
            <label htmlFor="etitle">Title *</label>
            <input
              id="etitle"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
            />
            {editErrors.title && (
              <span className="field-error">{editErrors.title}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="ecategory">Category *</label>
            <select
              id="ecategory"
              value={editForm.category}
              onChange={(e) =>
                setEditForm({ ...editForm, category: e.target.value })
              }
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {editErrors.category && (
              <span className="field-error">{editErrors.category}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="edescription">Description *</label>
            <textarea
              id="edescription"
              rows={5}
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
            />
            {editErrors.description && (
              <span className="field-error">{editErrors.description}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="eemail">Contact email *</label>
            <input
              id="eemail"
              type="email"
              value={editForm.contactEmail}
              onChange={(e) =>
                setEditForm({ ...editForm, contactEmail: e.target.value })
              }
            />
            {editErrors.contactEmail && (
              <span className="field-error">{editErrors.contactEmail}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="ephone">Phone (optional)</label>
            <input
              id="ephone"
              type="tel"
              value={editForm.contactPhone}
              onChange={(e) =>
                setEditForm({ ...editForm, contactPhone: e.target.value })
              }
            />
          </div>
          <div className="form-actions-row">
            <button
              type="button"
              className="btn-small ghost"
              onClick={() => {
                setEditing(false);
                setEditErrors({});
                setEditForm({
                  title: complaint.title,
                  category: complaint.category,
                  description: complaint.description,
                  contactEmail: complaint.contactEmail,
                  contactPhone: complaint.contactPhone || "",
                });
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary-solid" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      )}

      {!editing && (
        <div className="panel">
          <p>
            <span className="muted">Category</span> {complaint.category}
          </p>
          <p>
            <span className="muted">Submitted</span>{" "}
            {formatDate(complaint.createdAt)}
          </p>
          <p>
            <span className="muted">Last update</span>{" "}
            {formatDate(complaint.updatedAt)}
          </p>
          <p>{complaint.description}</p>
          {complaint.remarks && (
            <p>
              <span className="muted">Worker notes</span>
              <br />
              {complaint.remarks}
            </p>
          )}
          {complaint.adminRemarks && (
            <p>
              <span className="muted">Admin</span>
              <br />
              {complaint.adminRemarks}
            </p>
          )}
        </div>
      )}

      {complaint.feedback?.rating && (
        <div className="panel">
          <h3>Your feedback</h3>
          <p>
            {"★".repeat(complaint.feedback.rating)}
            {"☆".repeat(5 - complaint.feedback.rating)}
          </p>
          {complaint.feedback.comment && <p>{complaint.feedback.comment}</p>}
        </div>
      )}

      {canRate && (
        <form className="panel stack-form" onSubmit={handleFeedback}>
          <h3>Rate your experience</h3>
          <p className="muted">
            Completed complaints can receive a single 1–5 star rating.
          </p>
          <div className="form-group">
            <label htmlFor="rating">Stars</label>
            <select
              id="rating"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} — {"★".repeat(r)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="comment">Comment (optional)</label>
            <textarea
              id="comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary-solid" disabled={submitting}>
            {submitting ? "Saving…" : "Submit feedback"}
          </button>
        </form>
      )}
    </div>
  );
}
