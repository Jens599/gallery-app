import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EXTERNAL_SERVICES, IMAGE_URLS } from "./urls";

interface RemoveBgPayload {
  imageUrl: string;
  imageTitle: string;
  onUploadComplete: (file: File) => void;
}

type AddUrlPayload = {
  imageId: string;
  url: string;
  key: string;
};

const removeBackground = async (
  payload: RemoveBgPayload,
  token: string,
): Promise<void> => {
  try {
    const imageResponse = await fetch(payload.imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch the image for background removal.");
    }
    const imageBlob = await imageResponse.blob();

    const formData = new FormData();
    formData.append("image", imageBlob, payload.imageTitle);

    const removeBgResponse = await fetch(EXTERNAL_SERVICES.BG_REMOVAL, {
      method: "POST",
      body: formData,
    });

    if (!removeBgResponse.ok) {
      throw new Error("Failed to remove background from the image.");
    }

    const processedImageBlob = await removeBgResponse.blob();
    const processedImageFile = new File(
      [processedImageBlob],
      "image-nobg.png",
      {
        type: "image/png",
      },
    );

    payload.onUploadComplete(processedImageFile);
  } catch (error) {
    throw error;
  }
};

const addUrlToImage = async (
  payload: AddUrlPayload,
  token: string,
): Promise<any> => {
  const response = await fetch(IMAGE_URLS.ADD_URL(payload.imageId), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url: payload.url }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add URL to image.");
  }

  return response.json();
};

export const useRemoveBackground = () => {
  const queryClient = useQueryClient();

  const { mutate: removeBg, isPending: isRemoving } = useMutation<
    void,
    Error,
    RemoveBgPayload,
    unknown
  >({
    mutationFn: (payload) => {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      return removeBackground(payload, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });

  const { mutate: addUrl } = useMutation<
    any,
    Error,
    { payload: AddUrlPayload; token: string }
  >({
    mutationFn: async ({
      payload,
      token,
    }: {
      payload: { imageId: string; url: string; key: string };
      token: string;
    }) => {
      const response = await fetch(IMAGE_URLS.ADD_URL(payload.imageId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: payload.url, key: payload.key }),
      });
      if (!response.ok) {
        throw new Error("Failed to add URL");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });

  return { removeBg, addUrl, isRemoving };
};
