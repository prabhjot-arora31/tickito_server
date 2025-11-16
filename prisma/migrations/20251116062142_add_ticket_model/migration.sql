-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mainImage" TEXT NOT NULL,
    "images" TEXT[],
    "sponsors" TEXT[],

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);
