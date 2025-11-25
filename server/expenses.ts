// api/expenses.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../src/lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const expenses = await prisma.expense.findMany();
      return res.status(200).json(expenses);
    }

    if (req.method === "POST") {
      const { description, amount, paidBy, groupId } = req.body;

      const expense = await prisma.expense.create({
        data: {
          description,
          amount: Number(amount),
          paidBy,
          groupId,
        },
      });

      // update group total (mesma lógica do seu Express)
      try {
        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (group) {
          await prisma.group.update({
            where: { id: groupId },
            data: {
              total: Number(group.total || 0) + Number(amount),
            },
          });
        }
      } catch (e) {
        console.warn("Failed updating group total", e);
      }

      return res.status(201).json(expense);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("expenses handler error", err);
    return res.status(400).json({ error: err.message ?? "Unexpected error" });
  }
}
