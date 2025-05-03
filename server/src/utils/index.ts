import { ObjectId } from "mongoose";
import jwt from "jsonwebtoken";
import { config } from "src/config";

export const createToken = (id: ObjectId) => {
  const payload = { id };
  const secret = config.jwt.secret;
  const options = { expiresIn: 86400 * config.jwt.expiresIn };

  return jwt.sign(payload, secret, options);
};
