import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IMAGE_URLS } from "@/lib/urls";

interface ImageType {
  _id: string;
  url: string;
  title: string;
  userId: string;
  size: number;
  mimeType: string;
  createdAt: string;
  token: string;
}

export interface UploadThingFile {
  url: string;
  name: string;
  key: string;
  size: number;
  type: string;
}

interface ImageCreationPayload {
  url: string;
  title: string;
  size: number;
  mimeType: string;
}

interface SaveImageMetadataParams {
  uploadThingFile: UploadThingFile;
  token: string;
}

export async function saveImageMetadata(
  uploadThingFile: UploadThingFile,
  token: string,
): Promise<ImageType> {
  const payload: ImageCreationPayload = {
    url: uploadThingFile.url,
    title: uploadThingFile.name,
    size: uploadThingFile.size,
    mimeType: uploadThingFile.type,
  };

  const response = await fetch(IMAGE_URLS.BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    console.error(
      `Failed to create image in Express API. Status: ${response.status}`,
      errorData,
    );
    throw new Error(
      `Failed to save image metadata: ${errorData.message || "Server error"}`,
    );
  }

  const result = await response.json();
  console.log(`Image "${result.title}" saved to DB successfully!`);
  return result;
}

export function useSaveImage() {
  const queryClient = useQueryClient();

  return useMutation<
    ImageType,
    Error,
    { uploadThingFile: UploadThingFile; token: string }
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
