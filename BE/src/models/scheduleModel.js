import prisma from "../database/dbConfig.js";

class Schedule {
  static async create(scheduleData) {
    return prisma.schedule.create({ data: scheduleData });
  }

  static async findAll(userId) {
    return prisma.schedule.findMany({
      where: { user_id: userId },
      orderBy: [{ created_at: "asc" }],
    });
  }

  static async findById(id, userId) {
    return prisma.schedule.findFirst({
      where: { id: parseInt(id), user_id: userId },
    });
  }

  static async update(id, userId, scheduleData) {
    // Cek dulu schedule apakah milik user
    const existing = await prisma.schedule.findFirst({
      where: { id: parseInt(id), user_id: userId },
    });

    if (!existing) return null;

    return prisma.schedule.update({
      where: { id: existing.id }, // hanya pakai id karena prisma butuh unique
      data: scheduleData,
    });
  }

  static async delete(id, userId) {
    // Cek dulu schedule
    const existing = await prisma.schedule.findFirst({
      where: { id: parseInt(id), user_id: userId },
    });

    if (!existing) return null;

    return prisma.schedule.delete({
      where: { id: existing.id },
    });
  }
}

export default Schedule;
