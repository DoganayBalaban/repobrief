import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <>
      <style>{`
        .dash-layout {
          display: grid;
          grid-template-rows: auto 1fr;
          min-height: 100vh;
          background: #09090b;
        }
        .dash-nav {
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(9,9,11,0.95);
          backdrop-filter: blur(8px);
          position: sticky; top: 0; z-index: 50;
        }
        .dash-nav-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 52px;
        }
        .dash-logo {
          font-family: ui-monospace, monospace;
          font-size: 13px; letter-spacing: 0.1em;
          text-transform: uppercase; text-decoration: none;
          color: #f4f4f5;
        }
        .dash-logo span { color: #a3e635; }
        .dash-nav-links {
          display: flex; align-items: center; gap: 4px;
        }
        .nav-link {
          font-family: ui-monospace, monospace; font-size: 11px;
          color: #71717a; text-decoration: none;
          padding: 5px 10px; border-radius: 4px;
          transition: color .15s ease, background .15s ease;
          border: 1px solid transparent;
        }
        .nav-link:hover { color: #e4e4e7; background: rgba(255,255,255,0.04); }
        .nav-link.active { color: #e4e4e7; border-color: rgba(255,255,255,0.08); }
        .dash-user {
          display: flex; align-items: center; gap: 10px;
        }
        .user-avatar {
          width: 26px; height: 26px;
          border-radius: 50%; border: 1px solid rgba(255,255,255,0.1);
        }
        .user-name {
          font-family: ui-monospace, monospace; font-size: 11px;
          color: #52525b;
        }
        .signout-btn {
          font-family: ui-monospace, monospace; font-size: 11px;
          color: #52525b; background: none; border: 1px solid rgba(255,255,255,0.07);
          padding: 4px 10px; border-radius: 4px; cursor: pointer;
          transition: color .15s, border-color .15s;
        }
        .signout-btn:hover { color: #a1a1aa; border-color: rgba(255,255,255,0.15); }
        .dash-main {
          max-width: 1100px; margin: 0 auto;
          width: 100%; padding: 32px 24px;
        }
      `}</style>

      <div className="dash-layout">
        <nav className="dash-nav">
          <div className="dash-nav-inner">
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <Link href="/dashboard" className="dash-logo">
                repo<span>brief</span>
              </Link>
              <div className="dash-nav-links">
                <Link href="/dashboard" className="nav-link active">
                  repositories
                </Link>
              </div>
            </div>

            <div className="dash-user">
              {session.user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "avatar"}
                  className="user-avatar"
                />
              )}
              <span className="user-name">{session.user.name ?? session.user.email}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="signout-btn">sign out</button>
              </form>
            </div>
          </div>
        </nav>

        <main className="dash-main">{children}</main>
      </div>
    </>
  );
}
