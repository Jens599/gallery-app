"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

export default function GalleryUploader({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter((file) =>
      file.type.startsWith("image/"),
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: true,
    noClick: true,
    noKeyboard: true,
  });

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.relatedTarget === null) {
        setIsDragging(false);
      }
    };

    const handleDrop = () => {
      setIsDragging(false);
    };

    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, []);

  if (!isDragging && !isDragActive) {
    return <div className="">{children}</div>;
  }

  return (
    <div
      {...getRootProps()}
      className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-8 backdrop-blur-sm"
    >
      <input {...getInputProps()} />
      <div className="border-primary bg-background/50 flex w-full max-w-3xl flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 text-center">
        <Upload className="text-primary h-16 w-16" />
        <p className="text-2xl font-medium">Drop images here to upload</p>
        <p className="text-muted-foreground">
          Your files will be uploaded automatically
        </p>
      </div>
    </div>
  );
}
