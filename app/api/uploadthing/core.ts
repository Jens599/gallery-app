import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { saveImageMetadata } from "@/lib/upload-utils";

const f = createUploadthing();

interface DecodedToken {
  id: string;
}

const auth = async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    throw new UploadThingError("No Authorization header provided");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new UploadThingError(
      "Bearer token not found in Authorization header",
    );
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET environment variable is not defined on the server.",
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;

    return { id: decoded.id, token };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UploadThingError("Invalid or expired token");
    }
    console.error("Authentication error:", error);
    throw new UploadThingError("Authentication failed due to a server error.");
  }
};

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "32MB",
      maxFileCount: 10,
    },
  })
    .middleware(async ({ req }) => {
      const authResult = await auth(req);
      return { userId: authResult.id, token: authResult.token };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.ufsUrl);
      try {
        const createdImage = await saveImageMetadata(file, metadata.token);

        console.log("Image metadata saved to database.", createdImage);
        return {
          uploadedBy: metadata.userId,
          fileUrl: file.ufsUrl,
          imageId: createdImage._id,
          imageTitle: createdImage.title,
        };
      } catch (dbError) {
        console.error("Failed to save image metadata after upload:", dbError);
        throw new UploadThingError(
          `Post-upload processing failed: ${(dbError as Error).message}`,
        );
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
