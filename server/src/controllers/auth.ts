import { Request, Response } from "express";
import { User } from "../models";
import { UserType } from "../models/user.model";

const signup = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "Username, email, and password are required" });
  }

  try {
    const user = await User.signup(username, email, password);
    res.status(201).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message.includes("email")) {
      res.status(400).json({ error: "Email already in use" });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.login(email, password);
    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(401).json({ error: error.message });
  }
};

module.exports = { login, signup };
