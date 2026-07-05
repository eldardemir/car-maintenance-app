import { put } from "@vercel/blob";

const DATA_URL_PATTERN = /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/;

export const isDataImageUrl = (value) =>
  typeof value === "string" && DATA_URL_PATTERN.test(value);

export const uploadVehicleImage = async (imageUrl, userId) => {
  if (!isDataImageUrl(imageUrl)) {
    return imageUrl || null;
  }

  const match = imageUrl.match(DATA_URL_PATTERN);
  const contentType = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  const extension = contentType.split("/")[1];
  const buffer = Buffer.from(match[2], "base64");
  const pathname = `vehicles/user-${userId}/${Date.now()}.${extension}`;

  const blob = await put(pathname, buffer, {
    access: "public",
    contentType,
  });

  return blob.url;
};
