import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createComplaint } from "../../services/complaintService";

const categories = ["Technical", "Billing", "Product", "Delivery", "Other"];

const initial = {
  title: "",
  category: "",
  description: "",
  contactEmail: "",
  contactPhone: "",
};

export default function ComplaintForm() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Title is required";
    if (!form.category) next.category = "Select a category";
    if (!form.description.trim()) next.description = "Description is required";
    if (!form.contactEmail.trim()) {
      next.contactEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) {
      next.contactEmail = "Enter a valid email";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { data } = await createComplaint({
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim(),
      });
      toast.success(`Submitted. Reference: ${data.complaintId}`);
      setForm(initial);
      navigate("/dashboard/user");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Could not submit complaint. Try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel complaint-form-panel">
      <h2>Submit a complaint</h2>
      <p className="muted">
        Your complaint is sent to an administrator for approval before a worker
        picks it up.
      </p>
      <form onSubmit={handleSubmit} className="stack-form" noValidate>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="field-error">{errors.category}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={form.description}
            onChange={handleChange}
          />
          {errors.description && (
            <span className="field-error">{errors.description}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="contactEmail">Contact email *</label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            value={form.contactEmail}
            onChange={handleChange}
          />
          {errors.contactEmail && (
            <span className="field-error">{errors.contactEmail}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="contactPhone">Phone (optional)</label>
          <input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            value={form.contactPhone}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-primary-solid" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit complaint"}
        </button>
      </form>
    </div>
  );
}
