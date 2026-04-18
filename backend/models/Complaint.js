const mongoose = require("mongoose");

const STATUS = [
  "Awaiting Approval",
  "Rejected",
  "Pending",
  "In Progress",
  "Completed",
];

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Technical", "Billing", "Product", "Delivery", "Other"],
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: STATUS,
      default: "Awaiting Approval",
    },
    contactEmail: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      default: "",
    },
    remarks: {
      type: String,
      default: "",
    },
    adminRemarks: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: "" },
      submittedAt: { type: Date },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Complaint", complaintSchema);
