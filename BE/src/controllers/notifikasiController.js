import cron from "node-cron";
import TelegramBot from "node-telegram-bot-api";
import prisma from "../database/dbConfig.js";
import dotenv from "dotenv";

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });

// Function kirim notif
export async function sendTelegramNotif(schedule) {
  const chatId = process.env.CHAT_ID;
  const message = `Hallo Fall hari ini kamu ada jadwal ${schedule.title} dan kamu harus ${schedule.description}`;
  await bot.sendMessage(chatId, message);
}

// Scheduler: cek setiap menit
export function startScheduler() {
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    const localNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const currentDate = localNow.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentTime = localNow.toTimeString().slice(0, 8); // HH:MM:SS

    const schedules = await prisma.schedule.findMany({
      where: { date: new Date(currentDate), time: currentTime },
    });

    schedules.forEach(sendTelegramNotif);
  });
}
