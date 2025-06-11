"use client";

import { UploadDropzone } from "@/utils/uploadthing";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function GalleryUploader({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [token, setToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  if (token === null) {
    return (
      <div className="grid h-screen place-items-center">
        <p>Loading user session...</p>
      </div>
    );
  }

  const uploadHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

  return (
    <>
      <ProtectedRoute>
        <div className="grid place-items-center">
          <UploadDropzone
            endpoint="imageUploader"
            headers={uploadHeaders}
            onClientUploadComplete={(res) => {
              console.log("Files: ", res);
              toast.success("Upload Completed successfully!");

              queryClient.invalidateQueries({ queryKey: ["images"] });
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error:", error);

              toast.error(`Upload Failed: ${error.message}`);

              if (
                error.message.includes("Unauthorized") ||
                error.message.includes("token")
              ) {
                toast.warning(
                  "Please log in again. Your session might have expired.",
                );
              }
            }}
            className={cn([
              "ut-button:bg-red-500 ut-button:ut-readying:bg-red-500/50 ut-button:px-8",
              "ut-upload-icon:size-20",
              "ut-ready:w-1/2 ut-ready:bg-gray-900/80 ut-ready:my-8 ut-ready:py-8",
              "ut-readying:w-1/2 ut-readying:bg-gray-900/80 ut-readying:my-8 ut-readying:py-8",
              "ut-uploading:w-1/2 ut-uploading:bg-gray-900/80 ut-uploading:my-8 ut-uploading:py-8",
              "ut-button:mt-4",
            ])}
          />
        </div>
        {children}
        <Button
          className="fixed right-10 bottom-10 size-10 scale-150 rounded-full"
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          <ArrowUp />
        </Button>
      </ProtectedRoute>
    </>
  );
}
