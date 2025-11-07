import Expenditure from "../models/expenditureModel.js";

export const createExpenditure = async (req, res) => {
  try {
    const userId = req.user.id;

    const { item_name, description, harga, date } = req.body;

    const newExpenditure = await Expenditure.create({
      user_id: userId,
      item_name,
      description,
      harga,
      date: new Date(date),
    });
    res.status(201).json({
      message: "Data pengeluaran berhasil dibuat",
      Pengeluaran: newExpenditure,
    });
  } catch (error) {
    console.error("Error creating expenditures: ", error);
    res.status(500).json({ message: "Gagal Membuat Daftar Pengeluaran" });
  }
};

export const getAllExpenditures = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenditures = await Expenditure.findAll(userId);
    res.status(200).json(expenditures);
  } catch (error) {
    console.error("Error getting expenditures:", error);
    res.status(500).json({ message: "Gagal Mengambil Daftar Pengeluaran" });
  }
};

export const getExpenditureById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const expenditure = await Expenditure.findById(id, userId);
    if (!expenditure) {
      return res
        .status(404)
        .json({ message: "Data pengeluaran tidak ditemukan" });
    }
    res.status(200).json(expenditure);
  } catch (error) {
    console.error("Error getting expenditure by ID:", error);
    res.status(500).json({ message: "Gagal Data Pengeluaran" });
  }
};

export const updateExpenditure = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { date, ...otherData } = req.body;
    const dataToUpdate = { ...otherData };

    if (date) {
      dataToUpdate.date = new Date(date);
    }

    const updatedExpenditure = await Expenditure.update(
      id,
      userId,
      dataToUpdate
    );

    if (!updatedExpenditure) {
      return res
        .status(404)
        .json({ message: "Data pengeluaran tidak ditemukan" });
    }
    res.status(200).json({
      message: "Data pengeluaran berhasil diperbarui",
      schedule: updatedExpenditure,
    });
  } catch (error) {
    console.error("Error updating Expenditure:", error);
    if (error.code && error.code.startsWith("P")) {
      return res.status(400).json({
        message: "Kesalahan database saat memperbarui data pengeluaran",
      });
    }
    res.status(500).json({
      message: "Gagal memperbarui data pengeluaran",
      error: error.message,
    });
  }
};

export const deleteExpenditure = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deletedExpenditure = await Expenditure.delete(id, userId);
    if (!deletedExpenditure) {
      return res
        .status(404)
        .json({ message: "Data pengeluaran tidak ditemukan" });
    }
    res.status(200).json({ message: "Data pengeluaran berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting expenditure:", error);
    res.status(500).json({ message: "Gagal Menghapus Data Pengeluaran" });
  }
};
