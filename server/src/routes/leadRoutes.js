import express from "express";
import { createLead, getLeads, updateLeadStatus } from "../controllers/leadController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createLead);
router.get("/", protectAdmin, getLeads);
router.patch("/:id/status", protectAdmin, updateLeadStatus);

export default router;

