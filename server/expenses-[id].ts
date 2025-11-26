// api/expenses-[id].ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../src/lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const expense = await prisma.expense.findUnique({ where: { id: id! } });
    if (!expense) return res.status(404).json({ error: "Not found" });

    await prisma.expense.delete({ where: { id: id! } });

    try {
      const group = await prisma.group.findUnique({
        where: { id: expense.groupId },
      });
      if (group) {
        await prisma.group.update({
          where: { id: group.id },
          data: {
            total: Number(group.total || 0) - Number(expense.amount),
          },
        });
      }
    } catch (e) {
      console.warn("Failed updating group total after expense delete", e);
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("delete expense error", err);
    return res.status(400).json({ error: err.message ?? "Unexpected error" });
  }
}
