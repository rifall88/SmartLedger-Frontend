import express from "express";
import {
  createDebt,
  getAllDebts,
  getDebtById,
  updateDebt,
  deleteDebt,
} from "../controllers/debtController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, createDebt);
router.get("/", authenticate, getAllDebts);
router.get("/:id", authenticate, getDebtById);
router.put("/:id", authenticate, updateDebt);
router.delete("/:id", authenticate, deleteDebt);

export default router;
