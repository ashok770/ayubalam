import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/constants";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  const dashboardTo =
    user?.role === ROLES.ADMIN
      ? "/dashboard/admin"
      : user?.role === ROLES.WORKER
        ? "/dashboard/worker"
        : "/dashboard/user";

  return (
    <div className="homepage">
      <section className="hero">
        <h2>Online Complaint Management</h2>
        <p>
          Submit issues, follow clear approval and assignment steps, and rate the
          service when your case is completed. Administrators review every ticket;
          workers update progress in real time.
        </p>
        <div className="cta-buttons">
          {isAuthenticated ? (
            <Link to={dashboardTo} className="btn btn-primary">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                Create account
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Log in
              </Link>
            </>
          )}
          <Link to="/track" className="btn btn-secondary">
            Track a complaint
          </Link>
        </div>
      </section>

      <section className="features">
        <article className="feature">
          <h3>For users</h3>
          <p>
            Register, file a complaint, watch it move from approval to resolution,
            and leave a 1–5 star rating when it is marked complete.
          </p>
        </article>
        <article className="feature">
          <h3>For administrators</h3>
          <p>
            Review the full queue, approve or reject new complaints, and read
            feedback that helps you measure satisfaction.
          </p>
        </article>
        <article className="feature">
          <h3>For workers</h3>
          <p>
            See only approved items, advance statuses from pending through in
            progress to completed, and add short notes for the customer.
          </p>
        </article>
      </section>
    </div>
  );
}
