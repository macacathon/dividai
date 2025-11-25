// api/settlements.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../src/lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const settlements = await prisma.settlement.findMany();
      return res.status(200).json(settlements);
    }

    if (req.method === "POST") {
      const { fromUser, toUser, amount, groupId } = req.body;
      const settlement = await prisma.settlement.create({
        data: {
          fromUser,
          toUser,
          amount: Number(amount),
          groupId,
        },
      });
      return res.status(201).json(settlement);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("settlements handler error", err);
    return res.status(400).json({ error: err.message ?? "Unexpected error" });
  }
}
