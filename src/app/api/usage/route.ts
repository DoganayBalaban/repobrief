import { auth } from "@/auth";
import { db } from "@/lib/db";

const FREE_MONTHLY_LIMIT = 5;

export async function GET() {
  const session = await auth();
  const userId = session?.user?.email ?? session?.user?.name ?? null;

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const used = await db.analysis.count({
    where: { userId, createdAt: { gte: monthStart } },
  });

  return Response.json({
    used,
    limit: FREE_MONTHLY_LIMIT,
    remaining: Math.max(0, FREE_MONTHLY_LIMIT - used),
    resetsAt: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
  });
}
