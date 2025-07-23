import validator from "validator";
import { Document, Schema, model, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { AppError } from "../middleware/errorHandler";

export interface UserType extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserModel extends Model<UserType> {
  signup(username: string, email: string, password: string): Promise<UserType>;
  login(email: string, password: string): Promise<UserType>;
}

const userSchema = new Schema<UserType, UserModel>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
  },
  {
    timestamps: true,
  },
);

userSchema.statics.signup = async function (
  username: string,
  email: string,
  password: string,
): Promise<UserType> {
  if (!username || !email || !password) {
    throw new AppError(400, "All fields must be filled", {
      fields: {
        username: !username ? 0 : 1,
        email: !email ? 0 : 1,
        password: !password ? 0 : 1,
      },
    });
  }

  if (!validator.isEmail(email)) {
    throw new AppError(400, "Email is not valid", { email });
  }

  const exists = await this.findOne({ email });
  if (exists) {
    throw new AppError(409, "Email already exists", { email });
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new AppError(400, "Password is not strong enough", {
      requirements: {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      },
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  try {
    const user = await this.create({ username, email, password: hash });
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(500, "Failed to create user", {
        reason: error.message,
      });
    }
    throw new AppError(500, "Failed to create user");
  }
};

userSchema.statics.login = async function (
  email: string,
  password: string,
): Promise<UserType> {
  if (!email || !password) {
    throw new AppError(400, "All fields must be filled", {
      fields: {
        email: !email ? 0 : 1,
        password: !password ? 0 : 1,
      },
    });
  }

  if (!validator.isEmail(email)) {
    throw new AppError(400, "Email is not valid", { email });
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw new AppError(401, "Incorrect email or password");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError(401, "Incorrect email or password");
  }

  return user;
};

export const User = model<UserType, UserModel>("User", userSchema);
