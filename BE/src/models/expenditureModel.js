import prisma from "../database/dbConfig.js";

class Expenditure {
  static async create(expenditureData) {
    return prisma.expenditure.create({
      data: expenditureData,
    });
  }

  static async findAll(userId) {
    return prisma.expenditure.findMany({
      where: { user_id: userId },
      orderBy: [{ created_at: "asc" }],
    });
  }

  static async findById(id, userId) {
    return prisma.expenditure.findFirst({
      where: { id: parseInt(id), user_id: userId },
    });
  }

  static async update(id, userId, expenditureData) {
    return prisma.expenditure.update({
      where: { id: parseInt(id), user_id: userId },
      data: expenditureData,
    });
  }

  static async delete(id, userId) {
    return prisma.expenditure.delete({
      where: { id: parseInt(id), user_id: userId },
    });
  }
}
export default Expenditure;
