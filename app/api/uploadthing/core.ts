import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

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
      maxFileCount: 2,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);

      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("Files:", file);

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
