export type Image = {
  id: string;
  type: "jpeg" | "png" | "webp" | "gif" | "bmp" | "svg";
  src: string;
  alt?: string;
  uploadDate: Date;
};
