import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client"; // your prisma client
import APIResponse from "../services/ApiResponse.js";
import { validationResult } from "express-validator";
import generateToken from "../services/generateToken.js";

const prisma = new PrismaClient();
export const getUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      username: true,
      email: true,
    },
  });
  return new APIResponse(true, "Users Fetched", users, 200).send(res);
};

export const register = async (req, res, next) => {
  try {
    // Ensure req.body exists
    const body = req.body || {};
    const { username, email, password } = body;

    // Validate request body (if using express-validator)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return new APIResponse(
        false,
        "Validation failed",
        errors.array(),
        400
      ).send(res);
    }
    const isExists = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });
    if (isExists)
      return new APIResponse(
        false,
        "Already exists",
        "Username or email already exists",
        400
      ).send(res);
    // Hash password
    const hashedPass = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPass,
      },
    });

    // Send success response
    return new APIResponse(
      true,
      "User registered successfully",
      user,
      201
    ).send(res);
  } catch (err) {
    // Pass errors to your error-handling middleware
    next(err);
  }
};

export const login = async (req, res, next) => {
  const { email, username, password } = req.body;
  console.log("req.body:", req.body);
  const isExists = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });
  if (!isExists) {
    return new APIResponse(
      false,
      "Invalid email/username or password",
      null,
      401
    ).send(res);
  }

  const isPassCorrect = await bcrypt.compare(password, isExists.password);
  if (isPassCorrect) {
    console.log("pass correct");
    const token = generateToken({
      id: isExists.id,
      username: isExists.username,
      email: isExists.email,
    });
    return new APIResponse(
      true,
      "Login Success",
      {
        id: isExists.id,
        username: isExists.username,
        email: isExists.email,
        token,
      },
      200
    ).send(res);
  } else {
    console.log("pass incorrect");
    return new APIResponse(
      false,
      "Invalid email/username or password",
      null,
      401
    ).send(res);
  }
};
