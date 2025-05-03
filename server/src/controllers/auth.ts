import { Request, Response, NextFunction } from "express";
import { User } from "../models";
import { createToken } from "../utils";
import { AppError } from "../middleware/errorHandler";

const signup = async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      throw new AppError(400, "Username, email, and password are required", {
        fields: {
          username: !username ? "missing" : "provided",
          email: !email ? "missing" : "provided",
          password: !password ? "missing" : "provided",
        },
      });
    }

    const user = await User.signup(username, email, password);
    const token = createToken(user.id);

    res.status(201).json({
      status: "success",
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (err: unknown) {
    next(err);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new AppError(400, "Email and password are required", {
        fields: {
          email: !email ? "missing" : "provided",
          password: !password ? "missing" : "provided",
        },
      });
    }

    const user = await User.login(email, password);
    const token = createToken(user.id);

    res.status(200).json({
      status: "success",
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (err: unknown) {
    next(err);
  }
};

export { login, signup };
