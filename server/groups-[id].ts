// api/groups-[id].ts
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
    // delete expenses belonging to group
    await prisma.expense.deleteMany({ where: { groupId: id! } });
    // delete group
    await prisma.group.delete({ where: { id: id! } });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("delete group error", err);
    return res.status(400).json({ error: err.message ?? "Unexpected error" });
  }
}
