-- AlterTable
ALTER TABLE "SavedRecipe" ADD COLUMN     "ingredients" JSONB,
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "protein" DOUBLE PRECISION;
