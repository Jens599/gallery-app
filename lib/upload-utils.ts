import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IMAGE_URLS, EXTERNAL_SERVICES } from "@/lib/urls";
interface ImageType {
  _id: string;
  url: string[];
  title: string;
  userId: string;
  size: number;
  mimeType: string;
  createdAt: string;
  token: string;
}

export interface UploadThingFile {
  url: string | string[];
  name: string;
  key: string;
  size: number;
  type: string;
}

interface ImageCreationPayload {
  url: string[];
  title: string;
  size: number;
  mimeType: string;
}

interface SaveImageMetadataParams {
  uploadThingFile: UploadThingFile;
  token: string;
}

export async function saveImageMetadata(
  {
    url,
    key,
    keys,
    name,
    size,
    type,
  }: {
    url: string[];
    key: string;
    keys: string[];
    name: string;
    size: number;
    type: string;
  },
  token: string | null,
) {
  if (!token) {
    throw new Error("Not authorized");
  }

  const response = await fetch(IMAGE_URLS.BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, key, keys, title: name, size, mimeType: type }),
  });

  if (!response.ok) {
    throw new Error("Failed to save image metadata");
  }

  return response.json();
}

export async function updateURL(
  url: string,
  token: string,
): Promise<ImageType> {
  const response = await fetch(IMAGE_URLS.UPDATE_URL, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(`{${url}}`),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(
      `Failed to save image metadata: ${errorData.message || "Server error"}`,
    );
  }

  const result = await response.json();
  return result;
}

export async function BGRemoval(url: string, token: string) {
  const response = await fetch(EXTERNAL_SERVICES.BG_REMOVAL, {
    method: "POST",
    headers: {},
    body: JSON.stringify(`{"image": ${url}}`),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(
      `Failed to save image metadata: ${errorData.message || "Server error"}`,
    );
  }

  const result = await response.json();
  return result;
}

export function useUpdateUrl() {
  const queryClient = useQueryClient();

  return useMutation<ImageType, Error, { url: string; token: string }>({
    mutationFn: ({ url, token }) => updateURL(url, token),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
    onError: (error) => {
      console.error("Error updating image URL:", error);
    },
  });
}

export function useSaveImage() {
  const queryClient = useQueryClient();

  return useMutation<
    ImageType,
    Error,
    {
      uploadThingFile: {
        url: string[];
        key: string;
        keys: string[];
        name: string;
        size: number;
        type: string;
      };
      token: string;
    }
  >({
    mutationFn: ({ uploadThingFile, token }) =>
      saveImageMetadata(uploadThingFile, token),
    onSuccess: (data) => {
      console.log(`Image "${data.title}" saved to DB successfully!`);
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
    onError: (error) => {
      console.error("Error saving image metadata:", error);
    },
  });
}
