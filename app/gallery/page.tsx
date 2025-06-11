"use client";

import { IMAGE_URLS } from "@/lib/urls";
import { useQuery } from "@tanstack/react-query";

interface Image {
  _id: string;
  url: string;
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
    <div className="container mx-auto px-4 py-8">
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
            <div
              key={image._id}
              className="overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg"
            >
              <img
                src={image.url}
                alt={image.title}
                className="h-48 w-full object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="truncate font-medium text-gray-900">
                  {image.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(image.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {Math.round(image.size / 1024)} KB •{" "}
                  {image.mimeType.split("/")[1]?.toUpperCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
