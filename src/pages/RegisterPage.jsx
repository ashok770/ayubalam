import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { register } from "../services/authService";

export default function RegisterPage() {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email";
    }
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 6) {
      next.password = "Use at least 6 characters";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      loginSuccess(data.token, data.user);
      toast.success("Account created");
      navigate("/dashboard/user", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Could not register";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="panel auth-panel">
        <h2>Create your account</h2>
        <p className="muted">
          New registrations are standard users. Admin and worker roles are fixed
          demo accounts.
        </p>
        <form onSubmit={handleSubmit} className="stack-form" noValidate>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
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
            {loading ? "Creating…" : "Sign up"}
          </button>
        </form>
        <p className="muted small-margin-top">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
