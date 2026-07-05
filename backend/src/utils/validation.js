export const SERVICE_TYPES = [
  "MALI",
  "VELIKI",
  "OVJES",
  "MJENJAC",
  "VOLAN",
  "KOCNICE",
  "ELEKTRONIKA",
  "KLIMA",
  "OSTALO",
  "POLIRANJE",
  "DUBINSKO",
];

export const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const parseInteger = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

export const parsePositiveNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const parseValidDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const isValidYear = (year, min = 1886) => {
  const max = new Date().getFullYear() + 1;
  return Number.isInteger(year) && year >= min && year <= max;
};

export const isValidServiceType = (type) => SERVICE_TYPES.includes(type);

export const isValidImageDataUrl = (value) => {
  if (value === null || value === undefined || value === "") return true;
  if (typeof value !== "string") return false;

  const maxBytes = 5 * 1024 * 1024;
  const allowedPrefix = /^data:image\/(png|jpeg|jpg|webp);base64,/;

  return allowedPrefix.test(value) && value.length <= maxBytes;
};

export const isValidImageUrl = (value) => {
  if (isValidImageDataUrl(value)) return true;
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};
