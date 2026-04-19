"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";

const GH_ICON = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.8-.25.8-.56 0-.28-.02-1.2-.02-2.18-3.2.59-4.03-.78-4.28-1.5-.14-.36-.76-1.5-1.3-1.8-.44-.24-1.07-.82-.02-.84.99-.01 1.7.91 1.93 1.29 1.13 1.9 2.94 1.37 3.66 1.05.11-.82.44-1.37.8-1.69-2.84-.32-5.8-1.42-5.8-6.3 0-1.4.5-2.55 1.3-3.45-.13-.32-.57-1.63.12-3.4 0 0 1.07-.34 3.52 1.3a11.8 11.8 0 0 1 3.2-.43c1.08 0 2.17.15 3.2.43 2.45-1.65 3.52-1.3 3.52-1.3.7 1.77.26 3.08.13 3.4.8.9 1.3 2.04 1.3 3.45 0 4.9-2.97 5.98-5.8 6.3.46.4.86 1.16.86 2.35 0 1.69-.01 3.05-.01 3.47 0 .31.22.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/>
  </svg>
);

const STEPS = [
  { label: "opening GitHub OAuth window",      ms: 300  },
  { label: "awaiting your authorization",      ms: 700  },
  { label: "exchanging code for access token", ms: 1100 },
  { label: "fetching profile + repositories",  ms: 1500 },
  { label: "ready — redirecting to dashboard", ms: 1900 },
];

export function AuthCard() {
  const [status, setStatus] = useState<"idle" | "authorizing">("idle");
  const [stepIdx, setStepIdx] = useState(-1);
  const [progress, setProgress] = useState(0);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timerRefs.current.forEach(clearTimeout);
  }, []);

  async function handleSignIn() {
    if (status === "authorizing") return;
    setStatus("authorizing");
    setProgress(0);
    setStepIdx(0);

    // Animate steps 1-2, then trigger real OAuth redirect
    timerRefs.current.push(
      setTimeout(() => setStepIdx(1), STEPS[1].ms - STEPS[0].ms),
    );

    // Animate progress bar
    let p = 0;
    const tick = () => {
      p += 3;
      setProgress(Math.min(p, 38)); // cap at 38% before redirect
      if (p < 38) timerRefs.current.push(setTimeout(tick, 60));
    };
    timerRefs.current.push(setTimeout(tick, 60));

    // Redirect after showing first two steps
    timerRefs.current.push(
      setTimeout(() => {
        signIn("github", { callbackUrl: "/dashboard" });
      }, 900),
    );
  }

  const authorizing = status === "authorizing";

  return (
    <div className="auth-card">
      <div className="auth-card-head">
        <div className="auth-card-head-dots">
          <div className="dot" /><div className="dot" /><div className="dot" />
        </div>
        <div>oauth2 · authorize</div>
        <div>{authorizing ? "PENDING" : "READY"}</div>
      </div>
      <div className="auth-card-body">
        <h2 className="auth-card-title">Sign in to repobrief</h2>
        <p className="auth-card-sub">
          One click. No password, no form. We&apos;ll bounce you through GitHub and back in under ten seconds.
        </p>

        <button
          type="button"
          className="gh-btn"
          disabled={authorizing}
          onClick={handleSignIn}
        >
          <span className="gh-btn-left">
            {GH_ICON}
            <span>{authorizing ? "Authorizing…" : "Continue with GitHub"}</span>
          </span>
          <span className="gh-btn-arrow">→</span>
          {authorizing && (
            <span className="gh-btn-progress" style={{ width: `${progress}%` }} />
          )}
        </button>

        <div className="auth-state">
          {STEPS.map((s, i) => {
            const active = authorizing && i === stepIdx;
            const done   = authorizing && i < stepIdx;
            return (
              <div
                key={i}
                className={`state-row${active ? " active" : ""}${done ? " done" : ""}`}
              >
                <span className="state-idx">{String(i + 1).padStart(2, "0")}</span>
                <span className="state-label">
                  {done
                    ? <span style={{ textDecoration: "line-through", textDecorationColor: "var(--line-soft)" }}>{s.label}</span>
                    : s.label}
                </span>
                <span className="state-tick">
                  {done ? "✓ ok" : active ? "…" : "pending"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="auth-card-foot">
        <span>SECURE · OAUTH 2.0</span>
        <a href="https://github.com/settings/connections/applications" target="_blank" rel="noreferrer">having trouble?</a>
      </div>
    </div>
  );
}
