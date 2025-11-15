import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoute.js";
import scheduleRoutes from "./routes/scheduleRoute.js";
import expenditureRoutes from "./routes/expenditureRoute.js";
import debtRoutes from "./routes/debtRoute.js";
import { startScheduler } from "./controllers/notifikasiController.js";

dotenv.config();
const app = express();
app.use(cors());

app.use(express.json()); //digunakan untuk  mem-parsing body request berformat JSON
app.use(express.urlencoded({ extended: true }));

// Rute API
app.use("/api/users", userRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/expenditures", expenditureRoutes);
app.use("/api/debts", debtRoutes);

// Mulai scheduler sekali saat server start
startScheduler();

app.get("/", (req, res) => {
  res.send("Welcome to the Daily Schedule API!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Penulisan Salah!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));
