import express from "express";
import { body } from "express-validator";
import asyncHandler from "express-async-handler";
import { validate } from "../services/validate.js";
import {
  bookTicket,
  getIsBooked,
  getTicket,
} from "../controllers/ticket.controller.js";
import protectedRoute from "../middleware/protected_route.js";
import multer from "multer";

const ticketRoute = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB max

const bookTicketRules = [
  body("eventId").notEmpty().withMessage("Event ID is required"),
  body("total")
    .notEmpty()
    .withMessage("Please tell us how many tickets you want")
    .isInt({ min: 1 })
    .withMessage("Please give a valid number of tickets"),
];
// Field name is "idCard" in your frontend form
ticketRoute
  .post(
    "/book",
    upload.single("idCard"), // must match the form field
    protectedRoute,
    bookTicketRules,
    validate,
    asyncHandler(bookTicket)
  )
  .get("/get-ticket", protectedRoute, asyncHandler(getTicket))
  .get("/is-booked/:eventId", protectedRoute, asyncHandler(getIsBooked));

export default ticketRoute;
