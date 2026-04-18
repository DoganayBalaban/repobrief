import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashNavLinks } from "@/components/dash-nav-links";

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
        :root {
          --bg:      #faf9f6;
          --bg-alt:  #f2f1ec;
          --text:    #0f0e0d;
          --muted:   #6d6c65;
          --dim:     #a8a7a0;
          --coral:   #d97757;
          --coral-dim: rgba(217,119,87,0.11);
          --border:  rgba(0,0,0,0.07);
          --serif:   var(--font-playfair), Georgia, serif;
          --sans:    var(--font-dm-sans), system-ui, sans-serif;
          --mono:    var(--font-dm-mono), ui-monospace, monospace;
        }
        body { background: var(--bg); color: var(--text); font-family: var(--sans); }

        .dash-layout {
          display: grid; grid-template-rows: auto 1fr;
          min-height: 100vh; background: var(--bg);
        }
        .dash-nav {
          border-bottom: 1px solid var(--border);
          background: rgba(250,249,246,0.92);
          backdrop-filter: blur(14px);
          position: sticky; top: 0; z-index: 50;
        }
        .dash-nav-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 58px;
        }
        .dash-logo {
          font-family: var(--serif);
          font-size: 17px; font-weight: 700; letter-spacing: -0.02em;
          color: var(--text); text-decoration: none;
        }
        .dash-logo em { color: var(--coral); font-style: italic; }
        .dash-nav-links {
          display: flex; align-items: center; gap: 2px; margin-left: 20px;
        }
        .dash-nav-link {
          font-size: 13px; color: var(--muted);
          text-decoration: none; padding: 5px 12px; border-radius: 6px;
          transition: color .15s, background .15s;
        }
        .dash-nav-link:hover { color: var(--text); background: rgba(0,0,0,0.04); }
        .dash-nav-link.active { color: var(--text); background: rgba(0,0,0,0.05); }
        .dash-user {
          display: flex; align-items: center; gap: 10px;
        }
        .user-avatar {
          width: 26px; height: 26px;
          border-radius: 50%; border: 1px solid var(--border);
        }
        .user-name {
          font-size: 13px; color: var(--muted);
        }
        .signout-btn {
          font-size: 13px; color: var(--muted);
          background: none; border: 1px solid var(--border);
          padding: 5px 12px; border-radius: 6px; cursor: pointer;
          transition: color .15s, border-color .15s, background .15s;
          font-family: var(--sans);
        }
        .signout-btn:hover {
          color: var(--text); border-color: rgba(0,0,0,0.14);
          background: rgba(0,0,0,0.03);
        }
        .dash-main {
          max-width: 1100px; margin: 0 auto;
          width: 100%; padding: 36px 24px;
        }
        @media (max-width: 600px) {
          .user-name { display: none; }
          .dash-main { padding: 24px 16px; }
        }
      `}</style>

      <div className="dash-layout">
        <nav className="dash-nav">
          <div className="dash-nav-inner">
            <div style={{ display: "flex", alignItems: "center" }}>
              <Link href="/dashboard" className="dash-logo">Repo<em>Brief</em></Link>
              <DashNavLinks />
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
                <button type="submit" className="signout-btn">Sign out</button>
              </form>
            </div>
          </div>
        </nav>

        <main className="dash-main">{children}</main>
      </div>
    </>
  );
}
