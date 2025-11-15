-- CreateEnum
CREATE TYPE "Dificultate" AS ENUM ('USOR', 'MEDIU', 'GREU');

-- CreateEnum
CREATE TYPE "Categorie" AS ENUM ('DULCE', 'SARAT');

-- CreateTable
CREATE TABLE "Reteta" (
    "id" SERIAL NOT NULL,
    "titlu" TEXT NOT NULL,
    "descriere" TEXT NOT NULL,
    "timpMinute" INTEGER NOT NULL,
    "categorie" "Categorie" NOT NULL,
    "dificultate" "Dificultate" NOT NULL,
    "pozaUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reteta_pkey" PRIMARY KEY ("id")
);
