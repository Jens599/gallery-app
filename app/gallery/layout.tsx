"use client";

import { UploadDropzone } from "@/utils/uploadthing";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import { v4 as uuidv4 } from "uuid";
import { genUploader } from "uploadthing/client";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { saveImageMetadata } from "@/lib/upload-utils";

export default function GalleryUploader({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [token, setToken] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string>(uuidv4());
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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

  async function createWebpPreview(file: File): Promise<File> {
    let maxWidthOrHeight: number = 720; // Fixed preview size
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    URL.revokeObjectURL(img.src);
    const options = {
      maxWidthOrHeight,
      fileType: "image/webp",
      initialQuality: 0.8,
      useWebWorker: true,
    };
    const compressed = await imageCompression(file, options);
    const webpFile = new File(
      [compressed],
      file.name.replace(/\.[^.]+$/, ".webp"),
      {
        type: "image/webp",
      },
    );
    console.log("webpFile", webpFile);
    return webpFile;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
    }
  };

  const { uploadFiles } = genUploader<OurFileRouter>();

  const handleParallelUpload = async () => {
    setUploading(true);
    try {
      for (const file of selectedFiles) {
        const preview = await createWebpPreview(file);
        // Upload both files in parallel
        const [previewResult, originalResult] = await Promise.all([
          uploadFiles("imageUploader", {
            files: [preview],
            headers: uploadHeaders,
          }),
          uploadFiles("imageUploader", {
            files: [file],
            headers: uploadHeaders,
          }),
        ]);
        // Save metadata for the original file only
        if (
          originalResult &&
          originalResult[0] &&
          previewResult &&
          previewResult[0]
        ) {
          // Remove extension from name
          const nameWithoutExt = originalResult[0].name.replace(/\.[^.]+$/, "");
          await saveImageMetadata(
            {
              url: [previewResult[0].ufsUrl, originalResult[0].ufsUrl],
              key: originalResult[0].key,
              keys: [previewResult[0].key, originalResult[0].key],
              name: nameWithoutExt,
              size: originalResult[0].size,
              type: originalResult[0].type,
            },
            token,
          );
        }
        toast.success("Both files uploaded!");
      }
      setUploadId(uuidv4());
      queryClient.invalidateQueries({ queryKey: ["images"] });
      setSelectedFiles([]);
      setPreviewUrls([]);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Upload Failed: ${error.message}`);
      if (
        error.message.includes("Unauthorized") ||
        error.message.includes("token")
      ) {
        toast.warning("Please log in again. Your session might have expired.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <ProtectedRoute>
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <div className="bg-card mx-auto flex w-full max-w-md flex-col items-center justify-center rounded-xl p-8 shadow-lg">
            {/* Preview or Cloud Upload Icon */}
            {previewUrls.length > 0 ? (
              <div className="mb-4 flex w-full flex-wrap justify-center gap-2">
                {previewUrls.map((url, idx) => (
                  <img
                    key={
                      selectedFiles[idx]?.name
                        ? `${selectedFiles[idx].name}-${idx}`
                        : idx
                    }
                    src={url}
                    alt={`preview-${idx}`}
                    className="border-border bg-muted h-24 w-24 rounded border object-cover"
                  />
                ))}
              </div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="text-primary mb-4 h-10 w-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16v-4m0 0-2 2m2-2 2 2m6 2a4 4 0 00-3.8-5.995A5.5 5.5 0 006.5 13.5a4.5 4.5 0 00.5 8.995h10a4 4 0 004-4z"
                />
              </svg>
            )}
            <div className="text-card-foreground text-center text-lg font-semibold">
              Choose files
            </div>
            <input
              id="gallery-upload-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="gallery-upload-input" className="w-full">
              <span className="bg-destructive text-primary-foreground inline-block w-full cursor-pointer rounded px-6 py-2 text-center font-medium transition hover:opacity-90 active:scale-95">
                Choose File
              </span>
            </label>
            <Button
              onClick={handleParallelUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="mt-4 w-full"
            >
              {uploading
                ? "Uploading..."
                : "Upload Selected Images"}
            </Button>
            {selectedFiles.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {selectedFiles.map((file, idx) => null)}
              </div>
            )}
          </div>
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
