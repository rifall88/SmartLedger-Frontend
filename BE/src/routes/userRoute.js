import express from "express";
import { register, login, updateUser } from "../controllers/userController.js";
import {
  validateRegister,
  validateLogin,
  validateUpdate,
} from "../validators/userValidator.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.put("/login", authenticate, validateUpdate, updateUser);

export default router;
