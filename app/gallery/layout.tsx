"use client";

import { UploadDropzone } from "@/utils/uploadthing";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

export default function GalleryUploader({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ProtectedRoute>
        <div className="grid place-items-center">
          <UploadDropzone
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              // Do something with the response
              console.log("Files: ", res);
              alert("Upload Completed");
            }}
            onUploadError={(error: Error) => {
              // Do something with the error.
              alert(`ERROR! ${error.message}`);
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
