import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ComplaintList from "../components/complaints/ComplaintList";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { getMyComplaints } from "../services/complaintService";

export default function UserDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getMyComplaints();
        if (!cancelled) setComplaints(data.complaints || []);
      } catch {
        toast.error("Could not load your complaints");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>My complaints</h2>
          <p className="muted">
            Every new ticket waits for admin approval, then appears on the worker
            board.
          </p>
        </div>
        <Link to="/complaints/new" className="btn-primary-solid inline">
          New complaint
        </Link>
      </header>
      <ComplaintList
        complaints={complaints}
        buildLink={(c) => `/complaints/${c._id}`}
      />
    </div>
  );
}
