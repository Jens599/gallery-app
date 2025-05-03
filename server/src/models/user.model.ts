import validator from "validator";
import { Document, Schema, model, Model } from "mongoose";
import bcrypt from "bcryptjs";

class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
}

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
    throw new UserError("All fields must be filled");
  }

  if (!validator.isEmail(email)) {
    throw new UserError("Email is not valid");
  }

  const exists = await this.findOne({ email });
  if (exists) {
    throw new UserError("Email already exists");
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
    throw new UserError(
      "Password must contain at least 8 characters, including uppercase, lowercase, number and symbol",
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  try {
    const user = await this.create({ username, email, password: hash });
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw new UserError(error.message);
    }
    throw new UserError("Failed to create user");
  }
};

userSchema.statics.login = async function (
  email: string,
  password: string,
): Promise<UserType> {
  if (!email || !password) {
    throw new UserError("All fields must be filled");
  }

  if (!validator.isEmail(email)) {
    throw new UserError("Email is not valid");
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw new UserError("Incorrect Email or Password");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new UserError("Incorrect Email or Password");
  }

  return user;
};

export const User = model<UserType, UserModel>("User", userSchema);
