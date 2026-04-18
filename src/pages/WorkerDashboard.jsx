import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/common/LoadingSpinner";
import StatusBadge from "../components/tracking/StatusBadge";
import { getWorkerQueue, updateWorkerStatus } from "../services/complaintService";
import { formatDate } from "../utils/helpers";

const nextOptions = (current) => {
  if (current === "Pending") return ["In Progress"];
  if (current === "In Progress") return ["Completed"];
  return [];
};

export default function WorkerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getWorkerQueue();
      setComplaints(data.complaints || []);
    } catch {
      toast.error("Could not load worker queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (id, status, remarks) => {
    try {
      await updateWorkerStatus(id, { status, remarks });
      toast.success("Status updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard">
      <h2>Worker board</h2>
      <p className="muted">
        Approved complaints land here. Move each item from pending to in progress,
        then mark it complete when finished.
      </p>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Title</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => {
              const options = nextOptions(c.status);
              return (
                <tr key={c._id}>
                  <td>{c.complaintId}</td>
                  <td>{c.userId?.name}</td>
                  <td>{c.title}</td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="narrow">
                    <textarea
                      rows={2}
                      defaultValue={c.remarks}
                      id={`remarks-${c._id}`}
                    />
                  </td>
                  <td>{formatDate(c.updatedAt)}</td>
                  <td>
                    {options.length ? (
                      <div className="row-actions col">
                        {options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className="btn-small primary"
                            onClick={() => {
                              const remarks = document.getElementById(
                                `remarks-${c._id}`,
                              ).value;
                              handleStatusChange(c._id, opt, remarks);
                            }}
                          >
                            Set to {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="muted">No further updates</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
