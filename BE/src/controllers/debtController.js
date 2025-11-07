import Debt from "../models/debtModel.js";

export const createDebt = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      creditor_name,
      debtor_name,
      amount,
      borrowed_date,
      description,
      status,
      paid_date,
    } = req.body;

    const newDebt = await Debt.create({
      user_id: userId,
      creditor_name,
      debtor_name,
      amount,
      borrowed_date: new Date(borrowed_date),
      description,
      status,
      paid_date: paid_date ? new Date(paid_date) : null,
    });
    res.status(201).json({
      message: "Data hutang berhasil dibuat",
      Hutang: newDebt,
    });
  } catch (error) {
    console.error("Error creating debts: ", error);
    res.status(500).json({ message: "Gagal Membuat Daftar Hutang" });
  }
};

export const getAllDebts = async (req, res) => {
  try {
    const userId = req.user.id;
    const debts = await Debt.findAll(userId);
    res.status(200).json(debts);
  } catch (error) {
    console.error("Error getting debts:", error);
    res.status(500).json({ message: "Gagal Mengambil Daftar Hutang" });
  }
};

export const getDebtById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const debt = await Debt.findById(id, userId);
    if (!debt) {
      return res.status(404).json({ message: "Data Hutang tidak ditemukan" });
    }
    res.status(200).json(debt);
  } catch (error) {
    console.error("Error getting debt by ID:", error);
    res.status(500).json({ message: "Gagal Data Hutang" });
  }
};

export const updateDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { borrowed_date, paid_date, ...otherData } = req.body;
    const dataToUpdate = { ...otherData };

    if (borrowed_date) {
      dataToUpdate.borrowed_date = new Date(borrowed_date);
    }

    if (paid_date) {
      dataToUpdate.paid_date = new Date(paid_date);
    }

    const updatedDebt = await Debt.update(id, userId, dataToUpdate);

    if (!updatedDebt) {
      return res.status(404).json({ message: "Data hutang tidak ditemukan" });
    }
    res.status(200).json({
      message: "Data hutang berhasil diperbarui",
      schedule: updatedDebt,
    });
  } catch (error) {
    console.error("Error updating Debt:", error);
    if (error.code && error.code.startsWith("P")) {
      return res.status(400).json({
        message: "Kesalahan database saat memperbarui data hutang",
      });
    }
    res.status(500).json({
      message: "Gagal memperbarui data hutang",
      error: error.message,
    });
  }
};

export const deleteDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deletedDebt = await Debt.delete(id, userId);
    if (!deletedDebt) {
      return res.status(404).json({ message: "Data hutang tidak ditemukan" });
    }
    res.status(200).json({ message: "Data hutang berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting debt:", error);
    res.status(500).json({ message: "Gagal Menghapus Data hutang" });
  }
};
