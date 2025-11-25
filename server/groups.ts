// api/groups.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../src/lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const groups = await prisma.group.findMany();
      return res.status(200).json(groups);
    }

    if (req.method === "POST") {
      const { name, members = "", total = 0 } = req.body;
      const group = await prisma.group.create({
        data: {
          name,
          members,
          total: Number(total),
        },
      });
      return res.status(201).json(group);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("groups handler error", err);
    return res.status(400).json({ error: err.message ?? "Unexpected error" });
  }
}
