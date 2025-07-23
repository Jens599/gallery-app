import { Request, Response, NextFunction } from "express";
import { Image } from "../models/image.model";
import { AppError } from "../middleware/errorHandler";
import { Types } from "mongoose";
import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();

export const createImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { url, keys, title, size, mimeType } = req.body;

    if (!req.user?._id) {
      return next(new AppError(401, "User not authenticated"));
    }

    const image = await Image.createImage(
      url,
      keys,
      title,
      req.user._id.toString(),
      size,
      mimeType,
    );

    res.status(201).json({
      status: "success",
      data: { image },
    });
  } catch (error) {
    next(error);
  }
};

export const getImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return next(new AppError(400, "Invalid image ID"));
    }

    const image = await Image.findById(id);
    if (!image) {
      return next(new AppError(404, "Image not found"));
    }

    res.status(200).json({
      status: "success",
      data: { image },
    });
  } catch (error) {
    next(error);
  }
};

export const updateImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      return next(new AppError(400, "Invalid image ID"));
    }

    const image = await Image.findById(id);
    if (!image) {
      return next(new AppError(404, "Image not found"));
    }

    if (image.userId !== req.user?._id.toString()) {
      return next(new AppError(403, "Not authorized to update this image"));
    }

    image.title = title;
    await image.save();

    res.status(200).json({
      status: "success",
      data: { image },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return next(new AppError(400, "Invalid image ID"));
    }

    const image = await Image.findById(id);
    if (!image) {
      return next(new AppError(404, "Image not found"));
    }

    if (image.userId !== req.user?._id.toString()) {
      return next(new AppError(403, "Not authorized to delete this image"));
    }

    // Delete from Uploadthing
    if (image.keys && image.keys.length > 0) {
      await utapi.deleteFiles(image.keys);
    }

    await image.deleteOne();

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const getMyImages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    if (!req.user?._id) {
      return next(new AppError(401, "User not authenticated"));
    }

    const images = await Image.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Image.countDocuments({ userId: req.user._id });

    res.status(200).json({
      status: "success",
      data: {
        images,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateURL = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?._id) {
      return next(new AppError(401, "User not authenticated"));
    }

    const { url, key } = req.body;

    if (!url || !key) {
      return next(new AppError(400, "URL and key are required"));
    }

    const existingImage = await Image.findById(req.params.id);

    if (!existingImage) {
      return next(new AppError(404, "Image not found"));
    }

    if (existingImage.userId.toString() !== req.user._id.toString()) {
      return next(new AppError(403, "Forbidden: You do not own this image"));
    }

    const image = await Image.findByIdAndUpdate(
      req.params.id,
      { $push: { url: url, keys: key } },
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      status: "success",
      data: image,
    });
  } catch (err) {
    next(err);
  }
};
