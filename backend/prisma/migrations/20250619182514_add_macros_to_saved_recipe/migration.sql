/*
  Warnings:

  - Added the required column `carbs` to the `SavedRecipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fat` to the `SavedRecipe` table without a default value. This is not possible if the table is not empty.
  - Made the column `ingredients` on table `SavedRecipe` required. This step will fail if there are existing NULL values in that column.
  - Made the column `instructions` on table `SavedRecipe` required. This step will fail if there are existing NULL values in that column.
  - Made the column `protein` on table `SavedRecipe` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SavedRecipe" ADD COLUMN     "carbs" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "fat" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "ingredients" SET NOT NULL,
ALTER COLUMN "instructions" SET NOT NULL,
ALTER COLUMN "protein" SET NOT NULL;
