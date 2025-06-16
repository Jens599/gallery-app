import mongoose, { Document, Schema, model, Model } from "mongoose";
import { AppError } from "../middleware/errorHandler";

const IMAGE_CONSTRAINTS = {
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 100,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
} as const;

export interface ImageType extends Document {
  url: string[];
  title: string;
  userId: string;
  size: number;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  dimensions: {
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ImageModel extends Model<ImageType> {
  createImage(
    url: string,
    title: string,
    userId: string,
    size: number,
    mimeType: (typeof IMAGE_CONSTRAINTS.ALLOWED_MIME_TYPES)[number],
  ): Promise<ImageType>;
}

const imageSchema = new Schema<ImageType, ImageModel>(
  {
    url: {
      type: [String],
      required: [true, "URL is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    size: {
      type: Number,
      required: [true, "Size is required"],
    },
    mimeType: {
      type: String,
      required: [true, "MIME type is required"],
    },
  },
  {
    timestamps: true,
  },
);

imageSchema.statics.createImage = async (
  url: string[],
  title: string,
  userId: string,
  size: number,
  mimeType: (typeof IMAGE_CONSTRAINTS.ALLOWED_MIME_TYPES)[number],
): Promise<ImageType> => {
  title = title.trim();

  if (!url || !title || !userId || !size || !mimeType) {
    throw new AppError(400, "A required field is missing", {
      fields: {
        url: !url ? 0 : 1,
        title: !title ? 0 : 1,
        userId: !userId ? 0 : 1,
        size: !size ? 0 : 1,
        mimeType: !mimeType ? 0 : 1,
      },
    });
  }

  if (url.length > 2) {
    throw new AppError(400, "Maximum of 2 URLs allowed per image");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError(400, "User ID is not valid");
  }

  try {
    // Validate each URL in the array
    url.forEach(urlStr => new URL(urlStr));
  } catch (error) {
    throw new AppError(400, "One or more URLs have an invalid format");
  }

  if (size > IMAGE_CONSTRAINTS.MAX_FILE_SIZE) {
    throw new AppError(400, "File size exceeds maximum limit of 10MB");
  }

  if (!IMAGE_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new AppError(
      400,
      `Invalid file type. Allowed types: ${IMAGE_CONSTRAINTS.ALLOWED_MIME_TYPES.join(", ")}`,
    );
  }

  const image = await Image.create({
    url,
    title,
    userId,
    size,
    mimeType,
  });

  return image;
};

export const Image = model<ImageType, ImageModel>("Image", imageSchema);
