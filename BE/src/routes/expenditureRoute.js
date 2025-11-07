import express from "express";
import {
  createExpenditure,
  getAllExpenditures,
  getExpenditureById,
  updateExpenditure,
  deleteExpenditure,
} from "../controllers/expenditureController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, createExpenditure);
router.get("/", authenticate, getAllExpenditures);
router.get("/:id", authenticate, getExpenditureById);
router.put("/:id", authenticate, updateExpenditure);
router.delete("/:id", authenticate, deleteExpenditure);

export default router;
