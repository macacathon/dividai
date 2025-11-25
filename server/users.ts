// api/users.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../src/lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const users = await prisma.user.findMany();
      return res.status(200).json(users);
    }

    if (req.method === "POST") {
      const { email, name } = req.body;
      const user = await prisma.user.create({ data: { email, name } });
      return res.status(201).json(user);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("users handler error", err);
    return res.status(400).json({ error: err.message ?? "Unexpected error" });
  }
}
