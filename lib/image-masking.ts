export const applyImageMask = async (
  imageUrl: string,
  maskUrl: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = imageUrl;

    image.onload = () => {
      const mask = new Image();
      mask.crossOrigin = "Anonymous";
      mask.src = maskUrl;

      mask.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          return reject(new Error("Failed to get canvas context"));
        }

        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = image.width;
        maskCanvas.height = image.height;
        const maskCtx = maskCanvas.getContext("2d");

        if (!maskCtx) {
          return reject(new Error("Failed to get mask canvas context"));
        }

        maskCtx.drawImage(mask, 0, 0, image.width, image.height);
        const maskImageData = maskCtx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );
        const maskData = maskImageData.data;

        for (let i = 0; i < data.length; i += 4) {
          if (maskData[i] === 0) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };

      mask.onerror = () => {
        reject(new Error("Failed to load mask image"));
      };
    };

    image.onerror = () => {
      reject(new Error("Failed to load original image"));
    };
  });
}; 