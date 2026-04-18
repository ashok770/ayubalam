const express = require("express");
const mongoose = require("mongoose");
const Complaint = require("../models/Complaint");
const authMiddleware = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const router = express.Router();

function generateComplaintId() {
  return `CMP${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/** User may edit/delete only before the complaint enters the worker queue */
function userCanMutateComplaint(complaint) {
  return ["Awaiting Approval", "Rejected"].includes(complaint.status);
}

// Public: track by public complaint id
router.get("/track/:complaintId", async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId.trim(),
    }).select("-__v");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ success: true, complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Authenticated user: create complaint
router.post(
  "/",
  authMiddleware,
  authorize("user"),
  async (req, res) => {
    try {
      const { title, category, description, contactEmail, contactPhone } =
        req.body;

      if (!title?.trim() || !category || !description?.trim()) {
        return res.status(400).json({
          message: "Title, category, and description are required",
        });
      }
      if (!contactEmail?.trim()) {
        return res.status(400).json({ message: "Contact email is required" });
      }

      const complaint = await Complaint.create({
        complaintId: generateComplaintId(),
        title: title.trim(),
        category,
        description: description.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: (contactPhone || "").trim(),
        status: "Awaiting Approval",
        userId: req.user.userId,
      });

      res.status(201).json({
        success: true,
        message: "Complaint submitted successfully",
        complaintId: complaint.complaintId,
        complaint,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
);

// User: my complaints
router.get("/mine", authMiddleware, authorize("user"), async (req, res) => {
  try {
    const list = await Complaint.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, complaints: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// User: single complaint (owner only)
router.get("/mine/:id", authMiddleware, authorize("user"), async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json({ success: true, complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// User: update own complaint (before worker handling)
router.patch(
  "/mine/:id",
  authMiddleware,
  authorize("user"),
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid id" });
      }

      const { title, category, description, contactEmail, contactPhone } =
        req.body;

      if (!title?.trim() || !category || !description?.trim()) {
        return res.status(400).json({
          message: "Title, category, and description are required",
        });
      }
      if (!contactEmail?.trim()) {
        return res.status(400).json({ message: "Contact email is required" });
      }

      const allowedCategories = [
        "Technical",
        "Billing",
        "Product",
        "Delivery",
        "Other",
      ];
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }

      const complaint = await Complaint.findOne({
        _id: req.params.id,
        userId: req.user.userId,
      });
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      if (!userCanMutateComplaint(complaint)) {
        return res.status(400).json({
          message:
            "This complaint can no longer be edited once it has been approved for handling",
        });
      }

      complaint.title = title.trim();
      complaint.category = category;
      complaint.description = description.trim();
      complaint.contactEmail = contactEmail.trim();
      complaint.contactPhone = (contactPhone || "").trim();

      if (complaint.status === "Rejected") {
        complaint.status = "Awaiting Approval";
        complaint.adminRemarks = "";
      }

      await complaint.save();

      res.json({
        success: true,
        message: "Complaint updated",
        complaint,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// User: delete own complaint (before worker handling)
router.delete(
  "/mine/:id",
  authMiddleware,
  authorize("user"),
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid id" });
      }

      const complaint = await Complaint.findOne({
        _id: req.params.id,
        userId: req.user.userId,
      });
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      if (!userCanMutateComplaint(complaint)) {
        return res.status(400).json({
          message:
            "This complaint can only be deleted before it is approved for handling",
        });
      }

      await Complaint.deleteOne({ _id: complaint._id });
      res.json({ success: true, message: "Complaint deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// User: feedback after completed
router.post(
  "/mine/:id/feedback",
  authMiddleware,
  authorize("user"),
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const { rating, comment } = req.body;
      const r = Number(rating);
      if (!Number.isInteger(r) || r < 1 || r > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be an integer between 1 and 5" });
      }

      const complaint = await Complaint.findOne({
        _id: req.params.id,
        userId: req.user.userId,
      });
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      if (complaint.status !== "Completed") {
        return res.status(400).json({
          message: "Feedback is only allowed after the complaint is completed",
        });
      }
      if (complaint.feedback?.rating) {
        return res
          .status(400)
          .json({ message: "Feedback has already been submitted" });
      }

      complaint.feedback = {
        rating: r,
        comment: (comment || "").toString().slice(0, 2000),
        submittedAt: new Date(),
      };
      await complaint.save();

      res.json({
        success: true,
        message: "Thank you for your feedback",
        complaint,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Admin: all complaints
router.get("/admin/all", authMiddleware, authorize("admin"), async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: complaints that include user feedback
router.get(
  "/admin/feedback",
  authMiddleware,
  authorize("admin"),
  async (req, res) => {
    try {
      const complaints = await Complaint.find({
        "feedback.rating": { $exists: true, $ne: null },
      })
        .populate("userId", "name email")
        .sort({ "feedback.submittedAt": -1 });
      res.json({ success: true, complaints });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Admin: approve or reject
router.patch(
  "/admin/:id/decision",
  authMiddleware,
  authorize("admin"),
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const { action, adminRemarks } = req.body;
      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({ message: "action must be approve or reject" });
      }

      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      if (complaint.status !== "Awaiting Approval") {
        return res.status(400).json({
          message: "Only complaints awaiting approval can be updated here",
        });
      }

      if (action === "approve") {
        complaint.status = "Pending";
      } else {
        complaint.status = "Rejected";
        complaint.adminRemarks = (adminRemarks || "").toString().slice(0, 2000);
      }
      await complaint.save();

      res.json({
        success: true,
        message:
          action === "approve"
            ? "Complaint approved and assigned to the worker queue"
            : "Complaint rejected",
        complaint,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Worker: approved queue (not rejected, not awaiting approval)
router.get(
  "/worker/queue",
  authMiddleware,
  authorize("worker"),
  async (req, res) => {
    try {
      const complaints = await Complaint.find({
        status: { $in: ["Pending", "In Progress", "Completed"] },
      })
        .populate("userId", "name email")
        .sort({ updatedAt: -1 });
      res.json({ success: true, complaints });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Worker: update status along allowed transitions
router.patch(
  "/worker/:id/status",
  authMiddleware,
  authorize("worker"),
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid id" });
      }
      const { status, remarks } = req.body;
      const allowed = ["Pending", "In Progress", "Completed"];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      if (
        complaint.status === "Awaiting Approval" ||
        complaint.status === "Rejected"
      ) {
        return res.status(400).json({
          message: "This complaint is not in the worker queue yet",
        });
      }

      const current = complaint.status;
      const transitions = {
        Pending: ["In Progress"],
        "In Progress": ["Completed"],
        Completed: [],
      };

      if (!transitions[current]?.includes(status)) {
        return res.status(400).json({
          message: `Cannot move from "${current}" to "${status}"`,
        });
      }

      complaint.status = status;
      if (remarks !== undefined) {
        complaint.remarks = remarks.toString().slice(0, 2000);
      }
      await complaint.save();

      res.json({ success: true, message: "Status updated", complaint });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
