import mongoose, { Document, Schema, model, Model } from "mongoose";
import { AppError } from "../middleware/errorHandler";

const IMAGE_CONSTRAINTS = {
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 100,
  MIN_DIMENSION: 50,
  MAX_DIMENSION: 8000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  MAX_ASPECT_RATIO: 5, // max 5:1 ratio
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
} as const;

export interface ImageType extends Document {
  url: string;
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
    width: number,
    height: number,
  ): Promise<ImageType>;
}

const imageSchema = new Schema<ImageType, ImageModel>(
  {
    url: {
      type: String,
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
    dimensions: {
      width: {
        type: Number,
        required: [true, "Width is required"],
      },
      height: {
        type: Number,
        required: [true, "Height is required"],
      },
    },
  },
  {
    timestamps: true,
  },
);

imageSchema.statics.createImage = async (
  url: string,
  title: string,
  userId: string,
  size: number,
  mimeType: (typeof IMAGE_CONSTRAINTS.ALLOWED_MIME_TYPES)[number],
  width: number,
  height: number,
): Promise<ImageType> => {

  title = title.trim();

  if (!url || !title || !userId || !size || !mimeType || !width || !height) {
    throw new AppError(400, "A required field is missing", {
      fields: {
        url: !url ? 0 : 1,
        title: !title ? 0 : 1,
        userId: !userId ? 0 : 1,
        size: !size ? 0 : 1,
        mimeType: !mimeType ? 0 : 1,
        width: !width ? 0 : 1,
        height: !height ? 0 : 1,
      },
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError(400, "User ID is not valid");
  }

  try {
    new URL(url);
  } catch (error) {
    throw new AppError(400, "Invalid URL format");
  }

  if (
    title.length < IMAGE_CONSTRAINTS.MIN_TITLE_LENGTH ||
    title.length > IMAGE_CONSTRAINTS.MAX_TITLE_LENGTH
  ) {
    throw new AppError(
      400,
      `Title must be between ${IMAGE_CONSTRAINTS.MIN_TITLE_LENGTH} and ${IMAGE_CONSTRAINTS.MAX_TITLE_LENGTH} characters`,
    );
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

  if (
    width < IMAGE_CONSTRAINTS.MIN_DIMENSION ||
    height < IMAGE_CONSTRAINTS.MIN_DIMENSION
  ) {
    throw new AppError(
      400,
      `Image dimensions must be at least ${IMAGE_CONSTRAINTS.MIN_DIMENSION}x${IMAGE_CONSTRAINTS.MIN_DIMENSION} pixels`,
    );
  }

  if (
    width > IMAGE_CONSTRAINTS.MAX_DIMENSION ||
    height > IMAGE_CONSTRAINTS.MAX_DIMENSION
  ) {
    throw new AppError(
      400,
      `Image dimensions cannot exceed ${IMAGE_CONSTRAINTS.MAX_DIMENSION}x${IMAGE_CONSTRAINTS.MAX_DIMENSION} pixels`,
    );
  }

  const aspectRatio = Math.max(width / height, height / width);
  if (aspectRatio > IMAGE_CONSTRAINTS.MAX_ASPECT_RATIO) {
    throw new AppError(
      400,
      `Image aspect ratio cannot exceed ${IMAGE_CONSTRAINTS.MAX_ASPECT_RATIO}:1`,
    );
  }

  const image = await Image.create({
    url,
    title,
    userId,
    size,
    mimeType,
    dimensions: { width, height },
  });

  return image;
};

export const Image = model<ImageType, ImageModel>("Image", imageSchema);
