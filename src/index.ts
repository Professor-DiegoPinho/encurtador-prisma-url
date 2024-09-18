import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import httpStatus from "http-status";

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

app.post("/shorten", async (req: Request, res: Response) => {
  const { original } = req.body;

  const shortUrlSize = 6;
  const shortUrl = nanoid(shortUrlSize);

  try {
    const url = await prisma.url.create({
      data: {
        original,
        short: shortUrl,
      },
    });

    res.json(url);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao encurtar a URL" });
  }
});

app.get("/:shortUrl", async (req: Request, res: Response) => {
  const { shortUrl } = req.params;

  try {
    const url = await prisma.url.findUnique({
      where: { short: shortUrl },
    });

    if (url) {
      res.redirect(url.original);
    } else {
      res.status(httpStatus.NOT_FOUND).json({ error: "URL não encontrada" });
    }
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao redirecionar a URL" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
