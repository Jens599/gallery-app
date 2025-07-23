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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IMAGE_URLS } from "@/lib/urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Sparkles, Eraser, ChevronDown, Trash2 } from "lucide-react";
import { useRemoveBackground } from "@/lib/remove-bg";
import { genUploader } from "uploadthing/client";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { useState, useEffect } from "react";
import { applyImageMask } from "@/lib/image-masking";
import { Badge } from "@/components/ui/badge";

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

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest" },
  { value: "date-asc", label: "Oldest" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "size-desc", label: "Size (Largest)" },
  { value: "size-asc", label: "Size (Smallest)" },
];

const GRID_SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const VIEW_MODE_OPTIONS = [
  { value: "original", label: "Original" },
  { value: "masked", label: "Masked" },
  { value: "bgremoved", label: "BG Removed" },
];

const GalleryPage = () => {
  const queryClient = useQueryClient();
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

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await fetch(`${IMAGE_URLS.BASE}/${imageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });

  const handleDelete = (imageId: string) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      deleteImageMutation.mutate(imageId);
    }
  };

  const { removeBg, addUrl, isRemoving } = useRemoveBackground();
  const [isUploading, setIsUploading] = useState(false);
  const uploader = genUploader<OurFileRouter>();
  const [maskedImageUrl, setMaskedImageUrl] = useState<string | null>(null);
  const [isMasking, setIsMasking] = useState(false);
  const [sortOption, setSortOption] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gallery-sort") || "date-desc";
    }
    return "date-desc";
  });
  const [gridSize, setGridSize] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gallery-grid-size") || "medium";
    }
    return "medium";
  });
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gallery-view-mode") || "original";
    }
    return "original";
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("gallery-sort", sortOption);
  }, [sortOption]);

  useEffect(() => {
    localStorage.setItem("gallery-grid-size", gridSize);
  }, [gridSize]);

  useEffect(() => {
    localStorage.setItem("gallery-view-mode", viewMode);
  }, [viewMode]);

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
                  key: res[0].key,
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

  // Sorting logic
  const sortedImages = [...images].sort((a, b) => {
    switch (sortOption) {
      case "date-desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "date-asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "name-asc":
        return a.title.localeCompare(b.title);
      case "name-desc":
        return b.title.localeCompare(a.title);
      case "size-desc":
        return b.size - a.size;
      case "size-asc":
        return a.size - b.size;
      default:
        return 0;
    }
  });

  // Filtering by search
  const filteredImages = sortedImages.filter(img =>
    img.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">My Gallery</h1>
      {/* Controls Row */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between overflow-x-auto flex-wrap">
        <div className="flex items-center gap-2">
          <label className="font-medium">Sort by:</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[120px] justify-between">
                {SORT_OPTIONS.find(opt => opt.value === sortOption)?.label}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                {SORT_OPTIONS.map(opt => (
                  <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium">Grid size:</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[100px] justify-between">
                {GRID_SIZE_OPTIONS.find(opt => opt.value === gridSize)?.label}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={gridSize} onValueChange={setGridSize}>
                {GRID_SIZE_OPTIONS.map(opt => (
                  <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium">View:</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[120px] justify-between">
                {VIEW_MODE_OPTIONS.find(opt => opt.value === viewMode)?.label}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={viewMode} onValueChange={setViewMode}>
                {VIEW_MODE_OPTIONS.map(opt => (
                  <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredImages.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            No images found. Upload some images to get started!
          </p>
        </div>
      ) : (
        <div
          className={
            gridSize === "small"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
              : gridSize === "large"
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8"
              : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          }
        >
          {filteredImages.map((image) => {
            let displaySrc = image.url[0];
            if (viewMode === "bgremoved" && image.url.length === 3) {
              displaySrc = image.url[2];
            } else if (viewMode === "masked" && image.url.length === 3) {
              // Masked preview: generate on the fly using applyImageMask
              // We'll use a placeholder and lazy-load the mask
              // For now, show original until mask is loaded
              // (For full implementation, see below for async mask loading)
              displaySrc = image.url[1];
            }
            return (
              <Dialog
                key={image._id}
                onOpenChange={(open) => {
                  if (!open) {
                    setMaskedImageUrl(null);
                  }
                }}
              >
                <DialogTrigger>
                  <div className="overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg relative">
                    <img
                      src={displaySrc}
                      alt={image.title}
                      className={
                        gridSize === "small"
                          ? "h-28 w-full object-cover"
                          : gridSize === "large"
                          ? "h-72 w-full object-cover"
                          : "h-48 w-full object-cover"
                      }
                      loading="lazy"
                    />
                    {/* Indicators */}
                    <div className="absolute top-2 left-2 flex gap-1 z-10">
                      {image.url.length === 3 && (
                        <Badge variant="secondary" title="BG Removed"><Eraser className="w-3 h-3 mr-1 inline" />BG Removed</Badge>
                      )}
                      {image.url.length === 3 && (
                        <Badge variant="outline" title="Masked Preview"><Sparkles className="w-3 h-3 mr-1 inline" />Masked</Badge>
                      )}
                    </div>
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
                        title="Remove background from this image"
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
                        title="Preview masked version (with background removed)"
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
                        title="Download masked (background removed) version"
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
                        title="Download original image"
                      >
                        <Download />
                        Download
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleDelete(image._id)}
                        className="gap-2"
                        title="Delete image"
                      >
                        <Trash2 />
                        Delete
                      </Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
