import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3001"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  MONGODB_URI: z.string().url(),

  JWT_SECRET: z.string().min(process.env.NODE_ENV === "development" ? 0 : 32),
  JWT_EXPIRES_IN: z.string(),

  CLIENT_URL: z.string().url(),
});

const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
  console.error("❌ Invalid environment variables:", envParse.error.format());
  throw new Error("Invalid environment variables");
}

export const config = {
  server: {
    port: parseInt(envParse.data.PORT),
    nodeEnv: envParse.data.NODE_ENV,
    isDevelopment: envParse.data.NODE_ENV === "development",
    isProduction: envParse.data.NODE_ENV === "production",
    isTest: envParse.data.NODE_ENV === "test",
  },
  db: {
    url: envParse.data.MONGODB_URI,
  },
  jwt: {
    secret: envParse.data.JWT_SECRET,
    expiresIn: envParse.data.JWT_EXPIRES_IN,
  },
  cors: {
    origin: envParse.data.CLIENT_URL,
  },
} as const;
