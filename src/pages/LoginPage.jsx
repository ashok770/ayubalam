import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/authService";
import { ROLES } from "../utils/constants";

export default function LoginPage() {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email";
    }
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await login({
        email: form.email.trim(),
        password: form.password,
      });
      loginSuccess(data.token, data.user);
      toast.success("Welcome back");
      const target =
        location.state?.from?.pathname ||
        (data.user.role === ROLES.ADMIN
          ? "/dashboard/admin"
          : data.user.role === ROLES.WORKER
            ? "/dashboard/worker"
            : "/dashboard/user");
      navigate(target, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="panel auth-panel">
        <h2>Log in</h2>
        <p className="muted">
          Use your account email and password. Default admin and worker accounts
          are seeded on the server for demos.
        </p>
        <form onSubmit={handleSubmit} className="stack-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>
          <button type="submit" className="btn-primary-solid" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="muted small-margin-top">
          No account yet? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
