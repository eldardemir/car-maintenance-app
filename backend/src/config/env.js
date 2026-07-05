import "dotenv/config";

export const getRequiredEnv = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
};

export const JWT_SECRET = getRequiredEnv("JWT_SECRET");
