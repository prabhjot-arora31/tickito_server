import express from "express";
const userRoute = express.Router();
import asyncHandler from "express-async-handler";
import { getUsers, login, register } from "../controllers/user.controller.js";
import { body } from "express-validator";
import { validate } from "../services/validate.js";
const registerRules = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be atleast 3 characters"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is Invalid"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 characters long")
    .isStrongPassword()
    .withMessage(
      "Password should be strong (including lowercase , uppercase , numbers and special characters)"
    ),
];
userRoute
  .get("/get", asyncHandler(getUsers))
  .post("/register", registerRules, validate, asyncHandler(register)).post('/login',validate , asyncHandler(login));
export default userRoute;
