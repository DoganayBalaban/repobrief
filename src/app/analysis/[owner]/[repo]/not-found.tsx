import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <style>{`
        .nf-page {
          min-height: 100vh;
          background: #09090b;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .nf-card {
          text-align: center;
          max-width: 400px;
        }
        .nf-code {
          font-family: ui-monospace, monospace;
          font-size: 11px;
          color: #3f3f46;
          letter-spacing: 0.08em;
          margin-bottom: 16px;
        }
        .nf-title {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #f4f4f5;
          margin-bottom: 10px;
        }
        .nf-desc {
          font-family: ui-monospace, monospace;
          font-size: 12px;
          color: #52525b;
          line-height: 1.7;
          margin-bottom: 28px;
        }
        .nf-link {
          display: inline-block;
          font-family: ui-monospace, monospace;
          font-size: 12px;
          font-weight: 700;
          color: #000;
          background: #a3e635;
          padding: 8px 20px;
          border-radius: 3px;
          text-decoration: none;
          transition: background .15s;
        }
        .nf-link:hover { background: #bef264; }
      `}</style>

      <div className="nf-page">
        <div className="nf-card">
          <p className="nf-code">404 · NOT FOUND</p>
          <h1 className="nf-title">No analysis here</h1>
          <p className="nf-desc">
            This repo hasn&apos;t been analyzed yet, or the link is outdated.
            <br />
            Sign in and run a fresh analysis to generate a shareable link.
          </p>
          <Link href="/" className="nf-link">Go to RepoBrief →</Link>
        </div>
      </div>
    </>
  );
}
