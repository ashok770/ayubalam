import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../tracking/StatusBadge";
import { formatDate } from "../../utils/helpers";

export default function ComplaintCard({ complaint, linkTo }) {
  const body = (
    <>
      <div className="card-header-row">
        <h3>{complaint.title}</h3>
        <StatusBadge status={complaint.status} />
      </div>
      <p className="muted">
        <strong>ID:</strong> {complaint.complaintId}
      </p>
      <p className="muted">
        <strong>Category:</strong> {complaint.category}
      </p>
      <p className="muted">
        <strong>Updated:</strong> {formatDate(complaint.updatedAt)}
      </p>
      {complaint.feedback?.rating && (
        <p className="muted">
          <strong>Rating:</strong> {"★".repeat(complaint.feedback.rating)}
          {"☆".repeat(5 - complaint.feedback.rating)}
        </p>
      )}
    </>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="complaint-card complaint-card-link">
        {body}
      </Link>
    );
  }

  return <article className="complaint-card">{body}</article>;
}
