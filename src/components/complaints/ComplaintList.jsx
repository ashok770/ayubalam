import React from "react";
import ComplaintCard from "./ComplaintCard";

export default function ComplaintList({ complaints, buildLink }) {
  if (!complaints?.length) {
    return <p className="muted">No complaints to show.</p>;
  }

  return (
    <div className="complaint-list">
      {complaints.map((c) => (
        <ComplaintCard
          key={c._id}
          complaint={c}
          linkTo={buildLink ? buildLink(c) : null}
        />
      ))}
    </div>
  );
}
