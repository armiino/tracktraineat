import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

if (!process.env.DATABASE_URL?.includes("tracktraineat_test")) {
  throw new Error("Falsche Datenbank - .env.test verwenden.");
}