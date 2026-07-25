import mongoose from "mongoose";
import Lead from "../models/Lead.js";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const ALLOWED_STATUSES = ["New", "Contacted", "Closed"];

const cleanString = (value) => (typeof value === "string" ? value.trim() : "");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createLead = async (req, res, next) => {
  try {
    const name = cleanString(req.body.name);
    const email = cleanString(req.body.email).toLowerCase();
    const budgetRange = cleanString(req.body.budgetRange);
    const message = cleanString(req.body.message);

    if (!name || !email || !budgetRange || !message) {
      return res.status(400).json({
        message: "Name, email, budget range, and message are required",
      });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (name.length > 100 || email.length > 254 || budgetRange.length > 100 || message.length > 2000) {
      return res.status(400).json({ message: "One or more fields exceed the allowed length" });
    }

    const lead = await Lead.create({ name, email, budgetRange, message });

    return res.status(201).json({
      message: "Lead submitted successfully",
      lead,
    });
  } catch (error) {
    return next(error);
  }
};

export const getLeads = async (req, res, next) => {
  try {
    const rawSearch = req.query.search;

    if (rawSearch !== undefined && (typeof rawSearch !== "string" || rawSearch.length > 100)) {
      return res.status(400).json({ message: "Search query must be 100 characters or fewer" });
    }

    const search = cleanString(rawSearch);
    const filter = {};

    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ leads });
  } catch (error) {
    return next(error);
  }
};

export const updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid lead ID" });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Status must be New, Contacted, or Closed" });
    }

    const lead = await Lead.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.status(200).json({ message: "Lead status updated successfully", lead });
  } catch (error) {
    return next(error);
  }
};

