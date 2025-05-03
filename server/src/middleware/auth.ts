import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { User } from "../models";
import { AppError } from "./errorHandler";
import { Types } from "mongoose";

interface JwtPayload {
  id: Types.ObjectId;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: Types.ObjectId;
        username: string;
        email: string;
      };
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { authorization } = req.headers;

  if (!authorization?.startsWith("Bearer ")) {
    return next(new AppError(401, "Authorization required"));
  }

  try {
    const token = authorization.split(" ")[1];
    const { id } = jwt.verify(token, config.jwt.secret) as JwtPayload;

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError(401, "User no longer exists"));
    }

    req.user = {
      _id: user.id,
      username: user.username,
      email: user.email,
    };
    next();
  } catch (error) {
    next(new AppError(401, "Invalid token"));
  }
};
