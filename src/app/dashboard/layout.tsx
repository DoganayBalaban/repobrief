import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { getOctokit } from "@/lib/octokit";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard-shell";

const FREE_MONTHLY_LIMIT = 5;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const octokit = await getOctokit();
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 50,
    visibility: "all",
  });

  const userId =
    (session as { githubId?: string } | null)?.githubId ??
    session?.user?.email ??
    null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const used = userId
    ? await db.analysis.count({ where: { userId, createdAt: { gte: monthStart } } })
    : 0;
  const daysLeft = Math.ceil(
    (nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const resetsAt = nextReset.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const signOutForm = (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button type="submit" className="dash-signout-btn">
        sign out
      </button>
    </form>
  );

  return (
    <DashboardShell
      repos={data.map((r) => ({
        id: r.id,
        full_name: r.full_name,
        description: r.description ?? null,
        language: r.language ?? null,
        private: r.private,
        stargazers_count: r.stargazers_count,
        updated_at: r.updated_at ?? null,
        pushed_at: r.pushed_at ?? null,
      }))}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      usage={{ used, limit: FREE_MONTHLY_LIMIT, resetsAt, daysLeft }}
      signOutForm={signOutForm}
    >
      {children}
    </DashboardShell>
  );
}
