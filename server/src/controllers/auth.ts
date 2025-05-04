import { Request, Response, NextFunction } from "express";
import { User } from "../models";
import { createToken } from "../utils";
import { AppError } from "../middleware/errorHandler";
import { Image } from "../models/image.model";

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

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?._id) {
      return next(new AppError(401, "User not authenticated"));
    }

    // Delete all user's images first
    const imageDeleteResult = await Image.deleteMany({
      userId: req.user._id.toString(),
    });
    if (!imageDeleteResult.acknowledged) {
      return next(new AppError(500, "Failed to delete user's images"));
    }

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(req.user._id);
    if (!deletedUser) {
      return next(new AppError(404, "User not found"));
    }

    res.status(200).json({
      status: "success",
      message: "User and associated images successfully deleted",
      data: {
        deletedUser: {
          id: deletedUser._id,
          username: deletedUser.username,
          email: deletedUser.email,
        },
        imagesDeleted: imageDeleteResult.deletedCount,
      },
    });
  } catch (err: unknown) {
    next(err);
  }
};

export { login, signup, deleteUser };
