import prisma from "../database/dbConfig.js";

class Debt {
  static async create(debtData) {
    return prisma.debt.create({
      data: debtData,
    });
  }

  static async findAll(userId) {
    return prisma.debt.findMany({
      where: { user_id: userId },
      orderBy: [{ created_at: "asc" }],
    });
  }

  static async findById(id, userId) {
    return prisma.debt.findFirst({
      where: { id: parseInt(id), user_id: userId },
    });
  }

  static async update(id, userId, debtData) {
    return prisma.debt.update({
      where: { id: parseInt(id), user_id: userId },
      data: debtData,
    });
  }

  static async delete(id, userId) {
    return prisma.debt.delete({
      where: { id: parseInt(id), user_id: userId },
    });
  }
}
export default Debt;
