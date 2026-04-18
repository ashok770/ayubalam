import React from "react";

const map = {
  "Awaiting Approval": "status-awaiting",
  Rejected: "status-rejected",
  Pending: "status-pending",
  "In Progress": "status-in-progress",
  Completed: "status-completed",
};

export default function StatusBadge({ status }) {
  const cls = map[status] || "status-default";
  return (
    <span className={`status-pill ${cls}`} title={status}>
      {status}
    </span>
  );
}
