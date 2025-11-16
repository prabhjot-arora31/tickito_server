import "dotenv/config";
import express from "express";
import errorHandler from "./middleware/error_handler.js";
import userRoute from "./routes/user.route.js";
import helmet, { crossOriginResourcePolicy } from "helmet";
import eventRoute from "./routes/event.route.js";
import ticketRoute from "./routes/ticket.route.js";
import cors from "cors";
const app = express();

app.use(helmet());
// app.use(crossOriginResourcePolicy());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/health", (req, res) => {
  let kh = "";
  res.json({ msg: k });
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/event", eventRoute);
app.use("/api/v1/ticket", ticketRoute);

app.use(errorHandler);

export default app;
