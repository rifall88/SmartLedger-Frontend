import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    res.status(201).json({
      status: true,
      message: "Register Success",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Email Sudah Terdaftar" });
    }
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user)
      return res.status(401).json({ message: "Email atau Password salah" });

    if (!user.password) {
      console.error(`User ${user.email} tidak memiliki password di database`);
      return res.status(500).json({ message: "Internal server error" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Password Salah" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      status: true,
      message: "Login Success",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        access_token: token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password } = req.body;

    const dataToUpdate = {};

    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;

    const updatedUser = await User.update(userId, dataToUpdate);

    if (!updatedUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      message: "User berhasil diperbarui",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error updating user:", error);

    if (error.code && error.code.startsWith("P")) {
      return res.status(400).json({
        message: "Kesalahan database saat memperbarui user",
      });
    }
    res.status(500).json({
      message: "Gagal memperbarui user",
      error: error.message,
    });
  }
};
