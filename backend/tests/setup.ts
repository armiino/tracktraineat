import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

if (!process.env.SPOONACULAR_API_KEY) {
  throw new Error("SPOONACULAR_API_KEY fehlt in .env.test");
}

if (!process.env.DATABASE_URL?.includes("tracktraineat_test")) {
  throw new Error("Falsche Datenbank - .env.test verwenden.");
}
