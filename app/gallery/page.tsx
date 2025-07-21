"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IMAGE_URLS } from "@/lib/urls";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useRemoveBackground } from "@/lib/remove-bg";
import { genUploader } from "uploadthing/client";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { useState } from "react";
import { applyImageMask } from "@/lib/image-masking";

const downloadImage = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename || "download";
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Download failed:", error);
  }
};

interface Image {
  _id: string;
  url: string[];
  title: string;
  userId: string;
  size: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Pagination {
  total: number;
  page: number;
  pages: number;
}

interface ApiResponse {
  status: string;
  data: {
    images: Image[];
    pagination: Pagination;
  };
}

// Utility to format file size
function formatFileSize(size: number): string {
  if (size >= 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  }
  return Math.round(size / 1024).toLocaleString() + " KB";
}

const GalleryPage = () => {
  const { data, isLoading, isError, error } = useQuery<ApiResponse, Error>({
    queryKey: ["images"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(IMAGE_URLS.ME, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      return response.json();
    },
  });

  const { removeBg, addUrl, isRemoving } = useRemoveBackground();
  const [isUploading, setIsUploading] = useState(false);
  const uploader = genUploader<OurFileRouter>();
  const [maskedImageUrl, setMaskedImageUrl] = useState<string | null>(null);
  const [isMasking, setIsMasking] = useState(false);

  const handleRemoveBg = (image: Image) => {
    removeBg({
      imageUrl: image.url[0],
      imageTitle: image.title,
      onUploadComplete: async (file: File) => {
        setIsUploading(true);
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            alert("Authentication token not found. Please log in again.");
            setIsUploading(false);
            return;
          }

          const res = await uploader.uploadFiles("imageUploader", {
            files: [file],
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res && res.length > 0) {
            addUrl(
              {
                payload: {
                  imageId: image._id,
                  url: res[0].ufsUrl,
                },
                token,
              },
              {
                onSuccess: () => {
                  // URL added successfully
                },
              },
            );
          }
        } catch (error) {
          console.error("Upload failed:", error);
          alert(`ERROR! ${(error as Error).message}`);
        } finally {
          setIsUploading(false);
        }
      },
    });
  };

  const handlePreviewNoBg = async (image: Image) => {
    if (maskedImageUrl) {
      setMaskedImageUrl(null);
      return;
    }

    if (image.url.length < 3) return;
    setIsMasking(true);
    try {
      const maskedUrl = await applyImageMask(image.url[1], image.url[2]);
      setMaskedImageUrl(maskedUrl);
    } catch (error) {
      console.error("Failed to apply image mask:", error);
      alert("Failed to create preview.");
    } finally {
      setIsMasking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md rounded-lg bg-red-50 p-4 text-center text-red-500">
          <h2 className="mb-2 text-xl font-bold">Error loading images</h2>
          <p>
            {error?.message ||
              "Failed to load gallery. Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  const images = data?.data.images || [];

  return (
    <div className="relative container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">My Gallery</h1>

      {images.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            No images found. Upload some images to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <Dialog
              key={image._id}
              onOpenChange={(open) => {
                if (!open) {
                  setMaskedImageUrl(null);
                }
              }}
            >
              <DialogTrigger>
                <div className="overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg">
                  <img
                    src={image.url[0]}
                    alt={image.title}
                    className="h-48 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="p-4">
                    <h3 className="text-foreground truncate font-medium">
                      {image.title}
                    </h3>
                    <p className="text-primary text-sm">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-accent-foreground mt-1 text-xs">
                      {formatFileSize(image.size)} •{" "}
                      {image.mimeType.split("/")[1]?.toUpperCase()}
                    </p>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="flex h-[90vh] max-h-[90vh] flex-col sm:max-w-[90vw]">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle className="text-xl font-semibold">
                    {image.title}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-sm">
                    Uploaded on {new Date(image.createdAt).toLocaleDateString()}
                  </DialogDescription>
                </DialogHeader>
                <div className="relative flex-1 overflow-hidden">
                  <div className="flex h-full items-center justify-center p-4">
                    <img
                      src={maskedImageUrl || image.url[1]}
                      alt={image.title}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
                <DialogFooter className="flex-shrink-0 sm:justify-between">
                  <div className="text-muted-foreground text-sm">
                    {formatFileSize(image.size)} •{" "}
                    {image.mimeType.split("/")[1]?.toUpperCase()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={
                        image.url.length === 3 || isRemoving || isUploading
                      }
                      onClick={() => handleRemoveBg(image)}
                    >
                      {isRemoving
                        ? "Removing BG..."
                        : isUploading
                          ? "Uploading..."
                          : "Remove BG"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={image.url.length !== 3 || isMasking}
                      onClick={() => handlePreviewNoBg(image)}
                    >
                      {isMasking
                        ? "Applying Mask..."
                        : maskedImageUrl
                          ? "Show Original"
                          : "Preview without BG"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={image.url.length !== 3}
                      onClick={async () => {
                        if (image.url.length === 3) {
                          const maskedUrl = await applyImageMask(
                            image.url[1],
                            image.url[2],
                          );
                          downloadImage(maskedUrl, image.title + "-nobg");
                        }
                      }}
                    >
                      Download without BG
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        downloadImage(image.url[1], image.title || "download")
                      }
                      className="gap-2"
                    >
                      <Download />
                      Download
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
