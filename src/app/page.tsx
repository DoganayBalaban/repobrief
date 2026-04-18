import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RepoInputForm } from "@/components/repo-input-form";

const GH_ICON = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:         #faf9f6;
          --bg-card:    #ffffff;
          --bg-alt:     #f2f1ec;
          --text:       #0f0e0d;
          --muted:      #6d6c65;
          --coral:      #d97757;
          --coral-dim:  rgba(217,119,87,0.11);
          --coral-glow: rgba(217,119,87,0.06);
          --border:     rgba(0,0,0,0.07);
          --dark:       #0f0e0d;
          --dark-card:  #191817;
          --serif:      var(--font-playfair), Georgia, serif;
          --sans:       var(--font-dm-sans), system-ui, sans-serif;
          --mono:       var(--font-dm-mono), ui-monospace, monospace;
        }

        body { background: var(--bg); color: var(--text); font-family: var(--sans); }

        @keyframes rise {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-coral {
          0%, 100% { opacity: 0.55; }
          50%       { opacity: 1; }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes blob-drift {
          0%,100% { transform: translateX(-50%) scale(1); }
          50%     { transform: translateX(-50%) scale(1.06) translateY(10px); }
        }

        .r1 { animation: rise .65s cubic-bezier(.16,1,.3,1) .05s both; }
        .r2 { animation: rise .65s cubic-bezier(.16,1,.3,1) .15s both; }
        .r3 { animation: rise .65s cubic-bezier(.16,1,.3,1) .26s both; }
        .r4 { animation: rise .65s cubic-bezier(.16,1,.3,1) .37s both; }
        .r5 { animation: rise .65s cubic-bezier(.16,1,.3,1) .48s both; }
        .r6 { animation: rise .65s cubic-bezier(.16,1,.3,1) .60s both; }

        /* ── NAV ── */
        .lp-nav {
          position: sticky; top: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(1.5rem, 5vw, 5rem);
          height: 62px;
          border-bottom: 1px solid var(--border);
          background: rgba(250,249,246,0.9);
          backdrop-filter: blur(14px);
        }
        .lp-logo {
          font-family: var(--serif);
          font-size: 17px; font-weight: 700; letter-spacing: -0.02em;
          color: var(--text); text-decoration: none;
        }
        .lp-logo em { color: var(--coral); font-style: italic; }
        .nav-links { display: flex; align-items: center; gap: 2px; }
        .nav-link {
          font-size: 14px; font-weight: 400; color: var(--muted);
          text-decoration: none; padding: 6px 14px; border-radius: 6px;
          transition: color .15s, background .15s;
        }
        .nav-link:hover { color: var(--text); background: rgba(0,0,0,0.04); }
        .nav-signin {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 600;
          color: #fff; background: var(--text);
          text-decoration: none; padding: 8px 18px; border-radius: 8px;
          margin-left: 6px; transition: opacity .15s;
        }
        .nav-signin:hover { opacity: 0.8; }

        /* ── HERO ── */
        .lp-hero {
          position: relative;
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
          padding: clamp(5rem, 10vw, 8.5rem) clamp(1.5rem, 5vw, 4rem) 0;
          overflow: hidden;
        }
        .hero-blob {
          position: absolute;
          width: 900px; height: 600px;
          top: -180px; left: 50%;
          transform: translateX(-50%);
          background: radial-gradient(ellipse at center,
            rgba(217,119,87,0.13) 0%,
            rgba(217,119,87,0.05) 45%,
            transparent 70%);
          animation: blob-drift 12s ease-in-out infinite;
          pointer-events: none;
        }
        .hero-blob-2 {
          position: absolute;
          width: 600px; height: 400px;
          top: 60px; left: 55%;
          background: radial-gradient(ellipse at center,
            rgba(100,140,255,0.06) 0%,
            transparent 65%);
          pointer-events: none;
        }
        .lp-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--coral);
          background: var(--coral-dim); border: 1px solid rgba(217,119,87,0.18);
          padding: 5px 14px; border-radius: 100px;
          margin-bottom: 28px; position: relative; z-index: 1;
        }
        .eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--coral);
          animation: pulse-coral 2s ease-in-out infinite;
        }
        .lp-h1 {
          font-family: var(--serif);
          font-size: clamp(3.2rem, 7.5vw, 6.8rem);
          font-weight: 900; line-height: 0.94;
          letter-spacing: -0.035em;
          color: var(--text); max-width: 800px;
          margin-bottom: 24px;
          position: relative; z-index: 1;
        }
        .lp-h1 em { color: var(--coral); font-style: italic; }
        .lp-sub {
          font-size: clamp(15px, 1.8vw, 18px);
          font-weight: 300; color: var(--muted); max-width: 460px;
          line-height: 1.78; margin-bottom: 40px;
          position: relative; z-index: 1;
        }
        .hero-form-block {
          position: relative; z-index: 1;
          width: 100%; max-width: 520px;
          margin-bottom: 18px;
        }
        .hero-or {
          display: flex; align-items: center; gap: 12px;
          width: 100%; max-width: 520px;
          font-family: var(--mono); font-size: 11px; color: #c0bfb8;
          margin-bottom: 14px; position: relative; z-index: 1;
        }
        .hero-or::before, .hero-or::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }
        .btn-dark {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 600;
          color: #fff; background: var(--text);
          padding: 13px 26px; border-radius: 8px;
          text-decoration: none; transition: opacity .15s, transform .2s;
          position: relative; z-index: 1;
        }
        .btn-dark:hover { opacity: 0.82; transform: translateY(-1px); }
        .hero-hint {
          font-family: var(--mono); font-size: 11px; color: #b4b3ac;
          margin-bottom: 52px; position: relative; z-index: 1;
        }

        /* ── HERO BROWSER MOCKUP ── */
        .hero-browser {
          position: relative; z-index: 1;
          width: 100%; max-width: 940px;
          margin-top: 0;
          border-radius: 14px 14px 0 0;
          border: 1px solid rgba(0,0,0,0.1);
          border-bottom: none;
          background: #fff;
          box-shadow:
            0 2px 0 rgba(0,0,0,0.04),
            0 24px 80px rgba(0,0,0,0.1),
            0 8px 20px rgba(0,0,0,0.06);
          overflow: hidden;
        }
        .browser-bar {
          background: #f0efeb;
          border-bottom: 1px solid rgba(0,0,0,0.08);
          padding: 11px 16px;
          display: flex; align-items: center; gap: 0;
        }
        .browser-dots { display: flex; gap: 6px; margin-right: 14px; }
        .bd { width: 11px; height: 11px; border-radius: 50%; }
        .bd-r { background: #ff5f57; }
        .bd-y { background: #febc2e; }
        .bd-g { background: #28c840; }
        .browser-url {
          flex: 1; background: rgba(0,0,0,0.06); border-radius: 6px;
          padding: 5px 12px; font-family: var(--mono); font-size: 11px; color: #9d9c95;
        }
        .browser-body {
          background: #0f0e0d; padding: 28px 32px; min-height: 260px;
        }
        .an-prompt { font-family: var(--mono); font-size: 12px; color: #4a4947; margin-bottom: 20px; }
        .an-prompt span { color: var(--coral); }
        .an-sec { margin-bottom: 18px; }
        .an-label {
          font-family: var(--mono); font-size: 11px; color: var(--coral);
          margin-bottom: 7px;
          display: flex; align-items: center; gap: 8px;
        }
        .an-label::after { content:''; flex:1; height:1px; background:rgba(217,119,87,0.12); }
        .an-text { font-family: var(--mono); font-size: 12px; color: #6b6a62; line-height: 1.85; }
        .an-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .an-tag {
          font-family: var(--mono); font-size: 11px; color: #6b6a62;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          padding: 3px 9px; border-radius: 4px;
        }
        .an-diagram { font-family: var(--mono); font-size: 11px; color: #4a4947; line-height: 2.2; }
        .an-node {
          display: inline-block;
          border: 1px solid rgba(135,170,255,0.25);
          background: rgba(135,170,255,0.07);
          color: #87aaff;
          padding: 0 7px; border-radius: 3px;
        }
        .an-cursor {
          display: inline-block; width: 7px; height: 13px;
          background: var(--coral); vertical-align: middle; margin-left: 3px;
          animation: blink 1s step-end infinite;
        }

        /* ── FEATURES BAND ── */
        .features-band { background: var(--bg); }
        .feat-section {
          border-top: 1px solid var(--border);
          padding: clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 5rem);
        }
        .feat-inner {
          max-width: 1080px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(3rem, 5vw, 6rem);
          align-items: center;
        }
        .feat-inner.flip { }
        .feat-label {
          font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--coral); margin-bottom: 14px;
        }
        .feat-h2 {
          font-family: var(--serif);
          font-size: clamp(2rem, 3.2vw, 2.7rem);
          font-weight: 700; letter-spacing: -0.03em; line-height: 1.1;
          color: var(--text); margin-bottom: 18px;
        }
        .feat-desc {
          font-size: 15px; font-weight: 300;
          color: var(--muted); line-height: 1.82; margin-bottom: 28px;
        }
        .feat-points { list-style: none; display: flex; flex-direction: column; gap: 11px; }
        .feat-point {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 14px; color: var(--muted); line-height: 1.65;
        }
        .feat-arrow { color: var(--coral); flex-shrink: 0; margin-top: 1px; font-size: 13px; }
        .feat-point strong { color: var(--text); font-weight: 500; }

        /* feature card */
        .feat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px; overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
        }
        .feat-card-head {
          padding: 13px 18px;
          border-bottom: 1px solid var(--border);
          background: #f8f7f4;
          display: flex; align-items: center; gap: 8px;
        }
        .feat-card-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--coral); opacity: 0.65; }
        .feat-card-title { font-family: var(--mono); font-size: 12px; color: var(--muted); }
        .feat-card-body { padding: 22px; }

        /* diagram mockup */
        .diag-mock {
          background: #0f0e0d; padding: 18px 20px; border-radius: 8px;
          font-family: var(--mono); font-size: 11px; line-height: 2.3;
        }
        .diag-comment { color: #3d3c38; }
        .diag-node {
          display: inline-block;
          border: 1px solid rgba(135,170,255,0.22);
          background: rgba(135,170,255,0.07);
          color: #87aaff; padding: 0 6px; border-radius: 3px;
        }
        .diag-arrow { color: #3d3c38; }
        .diag-ann { color: #4a7a4a; font-size: 10px; }

        /* tech grid */
        .tech-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 7px;
        }
        .tech-badge {
          display: flex; flex-direction: column; gap: 3px;
          padding: 11px 13px; border: 1px solid var(--border);
          border-radius: 8px; background: var(--bg);
          transition: border-color .15s, background .15s;
        }
        .tech-badge:hover { border-color: rgba(217,119,87,0.25); background: var(--coral-dim); }
        .tech-name { font-family: var(--mono); font-size: 12px; font-weight: 500; color: var(--text); }
        .tech-role { font-family: var(--mono); font-size: 10px; color: var(--muted); }

        /* onboarding steps */
        .onboard-list { display: flex; flex-direction: column; }
        .onboard-step {
          display: flex; align-items: flex-start; gap: 13px;
          padding: 15px 0; border-bottom: 1px solid var(--border);
        }
        .onboard-step:last-child { border-bottom: none; }
        .step-num {
          width: 26px; height: 26px; border-radius: 50%;
          background: var(--coral-dim);
          border: 1px solid rgba(217,119,87,0.25);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-family: var(--mono); font-size: 11px; color: var(--coral);
        }
        .step-body { flex: 1; }
        .step-title { font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 2px; }
        .step-cmd { font-family: var(--mono); font-size: 11px; color: var(--muted); }
        .step-done {
          width: 17px; height: 17px; border-radius: 50%;
          background: rgba(40,200,64,0.12);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 9px; color: #28c840;
        }


        /* ── DARK SECTION ── */
        .lp-dark {
          background: var(--dark);
          border-top: 1px solid rgba(255,255,255,0.04);
          padding: clamp(4.5rem, 9vw, 8rem) clamp(1.5rem, 5vw, 5rem);
        }
        .dark-inner {
          max-width: 1080px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(3rem, 6vw, 6rem);
          align-items: start;
        }
        .dark-label {
          font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--coral); margin-bottom: 16px;
        }
        .dark-h2 {
          font-family: var(--serif);
          font-size: clamp(2.4rem, 4.5vw, 4rem);
          font-weight: 700; letter-spacing: -0.035em; line-height: 1.06;
          color: #f0ece3; margin-bottom: 22px;
        }
        .dark-h2 em { color: var(--coral); font-style: italic; }
        .dark-desc {
          font-size: 15px; color: #5d5c55; line-height: 1.82;
          font-weight: 300; margin-bottom: 36px;
        }
        .btn-coral {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 600;
          color: #fff; background: var(--coral);
          padding: 13px 26px; border-radius: 8px;
          text-decoration: none; transition: opacity .15s, transform .2s;
        }
        .btn-coral:hover { opacity: 0.88; transform: translateY(-1px); }
        .dark-feats { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
        .dark-feat {
          display: flex; align-items: flex-start; gap: 13px;
          padding: 16px 18px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.055);
          border-radius: 10px;
          transition: background .15s, border-color .15s;
        }
        .dark-feat:hover {
          background: rgba(255,255,255,0.055);
          border-color: rgba(217,119,87,0.18);
        }
        .dark-feat-icon {
          width: 30px; height: 30px; border-radius: 7px;
          background: var(--coral-dim);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 13px;
        }
        .dark-feat-info { flex: 1; }
        .dark-feat-title { font-size: 13px; font-weight: 500; color: #c0bdb6; margin-bottom: 2px; }
        .dark-feat-desc { font-size: 12px; color: #454440; font-weight: 300; line-height: 1.6; }

        /* ── PRICING ── */
        .lp-pricing {
          background: var(--bg);
          border-top: 1px solid var(--border);
          padding: clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 5rem);
        }
        .pricing-inner { max-width: 820px; margin: 0 auto; }
        .pricing-label {
          font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--coral); margin-bottom: 14px;
        }
        .pricing-h2 {
          font-family: var(--serif);
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 700; letter-spacing: -0.03em; line-height: 1.08;
          color: var(--text); margin-bottom: 52px;
        }
        .pricing-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }
        @media (max-width: 580px) { .pricing-grid { grid-template-columns: 1fr; } }
        .price-card {
          border-radius: 14px; padding: 34px 30px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          transition: border-color .2s;
        }
        .price-card:hover { border-color: rgba(0,0,0,0.14); }
        .price-card.pro {
          background: #0f0e0d; border-color: rgba(217,119,87,0.18);
        }
        .price-card.pro:hover { border-color: rgba(217,119,87,0.38); }
        .price-tier {
          font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--muted);
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px;
        }
        .price-card.pro .price-tier { color: var(--coral); }
        .coming-badge {
          font-family: var(--mono); font-size: 10px;
          color: var(--coral); background: var(--coral-dim);
          border: 1px solid rgba(217,119,87,0.18);
          padding: 2px 9px; border-radius: 4px;
        }
        .price-amount {
          font-family: var(--serif); font-size: 52px; font-weight: 900;
          letter-spacing: -0.04em; line-height: 1;
          color: var(--text); margin-bottom: 5px;
        }
        .price-card.pro .price-amount { color: #f0ece3; }
        .price-period { font-size: 13px; color: var(--muted); margin-bottom: 30px; }
        .price-card.pro .price-period { color: #4a4947; }
        .price-list {
          list-style: none; margin-bottom: 32px;
          display: flex; flex-direction: column; gap: 9px;
        }
        .price-item {
          display: flex; align-items: center; gap: 9px;
          font-size: 14px; font-weight: 300; color: var(--muted);
        }
        .price-item.on { color: var(--text); }
        .price-card.pro .price-item.on { color: #b8b5ae; }
        .price-check {
          width: 15px; height: 15px; border-radius: 50%;
          background: var(--coral-dim);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 9px; color: var(--coral);
        }
        .price-cross {
          width: 15px; height: 15px; border-radius: 50%;
          background: rgba(0,0,0,0.04);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 9px; color: #c5c4bc;
        }
        .price-btn {
          display: block; width: 100%; text-align: center;
          font-size: 14px; font-weight: 500; color: var(--text);
          text-decoration: none; border: 1px solid var(--border);
          padding: 12px 24px; border-radius: 8px;
          transition: border-color .15s, background .15s;
        }
        .price-btn:hover { border-color: rgba(0,0,0,0.18); background: rgba(0,0,0,0.03); }
        .price-btn-disabled {
          display: block; width: 100%; text-align: center;
          font-size: 14px; font-weight: 500; color: #4a4947;
          background: rgba(217,119,87,0.07);
          border: 1px solid rgba(217,119,87,0.14);
          padding: 12px 24px; border-radius: 8px; cursor: not-allowed;
        }

        /* ── FOOTER ── */
        .lp-footer {
          background: var(--bg-alt);
          border-top: 1px solid var(--border);
          padding: 26px clamp(1.5rem, 5vw, 5rem);
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 14px;
        }
        .footer-logo {
          font-family: var(--serif); font-size: 15px; font-weight: 700;
          color: var(--text); text-decoration: none;
        }
        .footer-logo em { color: var(--coral); font-style: italic; }
        .footer-links { display: flex; gap: 18px; }
        .footer-link { font-size: 13px; color: var(--muted); text-decoration: none; transition: color .15s; }
        .footer-link:hover { color: var(--text); }
        .footer-built { font-family: var(--mono); font-size: 11px; color: #c0bfb8; }

        @media (max-width: 860px) {
          .feat-inner { grid-template-columns: 1fr; }
          .feat-inner.flip > :first-child { order: 2; }
          .feat-inner.flip > :last-child  { order: 1; }
          .dark-inner { grid-template-columns: 1fr; }
          .tech-grid  { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 680px) {
          .nav-links a:not(.nav-signin) { display: none; }
          .lp-footer { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

        {/* NAV */}
        <nav className="lp-nav">
          <Link href="/" className="lp-logo">Repo<em>Brief</em></Link>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <Link href="/auth" className="nav-signin">{GH_ICON} Sign in</Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero">
          <div className="hero-blob" aria-hidden="true" />
          <div className="hero-blob-2" aria-hidden="true" />

          <div className="r1 lp-eyebrow">
            <span className="eyebrow-dot" />
            Powered by Claude · GitHub native
          </div>

          <h1 className="r2 lp-h1">
            Understand any<br /><em>repository,</em><br />instantly
          </h1>

          <p className="r3 lp-sub">
            Paste any public GitHub URL and get architecture diagrams, tech stack breakdowns, file maps, and onboarding guides — streamed live by Claude, no account needed.
          </p>

          <div className="r4 hero-form-block">
            <RepoInputForm theme="light" />
          </div>

          <div className="r4 hero-or">or sign in for private repos</div>

          <Link href="/auth" className="r4 btn-dark">{GH_ICON} Connect GitHub</Link>

          <p className="r5 hero-hint" style={{marginTop:"10px"}}>No credit card · 5 free analyses/month</p>

          <div className="r5 hero-browser">
            <div className="browser-bar">
              <div className="browser-dots">
                <div className="bd bd-r" /><div className="bd bd-y" /><div className="bd bd-g" />
              </div>
              <div className="browser-url">repobrief.vercel.app/dashboard/vercel/next.js</div>
            </div>
            <div className="browser-body">
              <p className="an-prompt">$ analyzing <span>vercel/next.js</span> — reading 15 key files···</p>
              <div className="an-sec">
                <p className="an-label">▶ description</p>
                <p className="an-text">Next.js is a production-grade React framework providing server-side rendering, static generation, file-based routing, and edge runtime support with zero configuration...</p>
              </div>
              <div className="an-sec">
                <p className="an-label">▶ tech_stack</p>
                <div className="an-tags">
                  {["TypeScript","React 19","Node.js","Rust / SWC","Turbopack","Webpack"].map(t=>(
                    <span key={t} className="an-tag">{t}</span>
                  ))}
                </div>
              </div>
              <div className="an-sec" style={{marginBottom:0}}>
                <p className="an-label">▶ architecture</p>
                <div className="an-diagram">
                  <div><span className="an-node">Browser</span> ──→ <span className="an-node">Next.js</span> ──→ <span className="an-node">RSC Layer</span></div>
                  <div style={{paddingLeft:"1.2rem"}}>└──→ <span className="an-node">API Route /analyze</span> ──→ <span className="an-node">Claude SDK</span><span className="an-cursor"/></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <div id="features" className="features-band">

          {/* 1 — Architecture */}
          <section className="feat-section">
            <div className="feat-inner">
              <div>
                <p className="feat-label">{'// architecture'}</p>
                <h2 className="feat-h2">Visual architecture,<br />auto-generated</h2>
                <p className="feat-desc">
                  RepoBrief reads your entry points, configs, and module structure to produce an accurate Mermaid flowchart — no manual diagramming needed.
                </p>
                <ul className="feat-points">
                  {[
                    { t: <><strong>Mermaid diagrams rendered inline</strong> — see how services, layers, and data flow connect at a glance</> },
                    { t: <><strong>15 key files analyzed</strong> — entry points, package manifests, schema files, CI configs, and more</> },
                    { t: <><strong>Streamed live</strong> — watch the diagram emerge as Claude reads your codebase in real time</> },
                  ].map((p,i) => (
                    <li key={i} className="feat-point">
                      <span className="feat-arrow">→</span><span>{p.t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="feat-card">
                  <div className="feat-card-head">
                    <div className="feat-card-dot" />
                    <span className="feat-card-title">◈ Architecture</span>
                  </div>
                  <div className="feat-card-body">
                    <div className="diag-mock">
                      <div className="diag-comment">graph TD</div>
                      <div>&nbsp;&nbsp;<span className="diag-node">Client</span> <span className="diag-arrow">──→</span> <span className="diag-node">Next.js</span> <span className="diag-ann">[App Router]</span></div>
                      <div>&nbsp;&nbsp;<span className="diag-node">Next.js</span> <span className="diag-arrow">──→</span> <span className="diag-node">API Route</span> <span className="diag-ann">/api/analyze</span></div>
                      <div>&nbsp;&nbsp;<span className="diag-node">API Route</span> <span className="diag-arrow">──→</span> <span className="diag-node">file-tree</span> <span className="diag-ann">[GitHub]</span></div>
                      <div>&nbsp;&nbsp;<span className="diag-node">API Route</span> <span className="diag-arrow">──→</span> <span className="diag-node">Claude SDK</span> <span className="diag-ann">[stream]</span></div>
                      <div>&nbsp;&nbsp;<span className="diag-node">Claude SDK</span> <span className="diag-arrow">──→</span> <span className="diag-node">Client</span> <span className="diag-ann">[SSE]</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2 — Tech Stack (flipped) */}
          <section className="feat-section" style={{background:"var(--bg-alt)"}}>
            <div className="feat-inner flip">
              <div>
                <div className="feat-card">
                  <div className="feat-card-head">
                    <div className="feat-card-dot" />
                    <span className="feat-card-title">◉ Tech Stack</span>
                  </div>
                  <div className="feat-card-body">
                    <div className="tech-grid">
                      {[
                        {name:"TypeScript", role:"language"},
                        {name:"React 19",   role:"ui framework"},
                        {name:"Next.js 16", role:"full-stack"},
                        {name:"Claude AI",  role:"intelligence"},
                        {name:"Octokit",    role:"github api"},
                        {name:"NextAuth v5",role:"auth"},
                        {name:"Tailwind v4",role:"styling"},
                        {name:"Mermaid",    role:"diagrams"},
                        {name:"DOMPurify",  role:"security"},
                      ].map(t=>(
                        <div key={t.name} className="tech-badge">
                          <span className="tech-name">{t.name}</span>
                          <span className="tech-role">{t.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="feat-label">{'// tech stack'}</p>
                <h2 className="feat-h2">Every dependency,<br />decoded and labeled</h2>
                <p className="feat-desc">
                  Beyond listing packages, RepoBrief understands the role each technology plays — framework, runtime, tooling, or security — so you know what matters.
                </p>
                <ul className="feat-points">
                  {[
                    { t: <><strong>Categorized automatically</strong> — languages, frameworks, tools, and infrastructure all grouped</> },
                    { t: <><strong>Inferred from source</strong> — not just package.json, but actual usage patterns in code</> },
                    { t: <><strong>Export to Markdown</strong> — paste your brief directly into a README, PR, or Notion doc</> },
                  ].map((p,i) => (
                    <li key={i} className="feat-point">
                      <span className="feat-arrow">→</span><span>{p.t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 3 — Onboarding Guide */}
          <section className="feat-section">
            <div className="feat-inner">
              <div>
                <p className="feat-label">{'// onboarding'}</p>
                <h2 className="feat-h2">From clone to<br />contributor, faster</h2>
                <p className="feat-desc">
                  Claude generates a step-by-step onboarding guide tailored to your specific repo — setup commands, environment requirements, and project conventions included.
                </p>
                <ul className="feat-points">
                  {[
                    { t: <><strong>Setup steps extracted</strong> from READMEs, Makefiles, docker-compose, and CI configs</> },
                    { t: <><strong>Environment variables mapped</strong> — what&apos;s required, what&apos;s optional, what&apos;s secret</> },
                    { t: <><strong>Works on any repo</strong> — public repos need no account, private repos use GitHub OAuth</> },
                  ].map((p,i) => (
                    <li key={i} className="feat-point">
                      <span className="feat-arrow">→</span><span>{p.t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="feat-card">
                  <div className="feat-card-head">
                    <div className="feat-card-dot" />
                    <span className="feat-card-title">◐ Onboarding Guide</span>
                  </div>
                  <div className="feat-card-body">
                    <div className="onboard-list">
                      {[
                        {n:"1", title:"Clone the repository",    cmd:"git clone github.com/vercel/next.js", done:true},
                        {n:"2", title:"Install dependencies",     cmd:"pnpm install",                       done:true},
                        {n:"3", title:"Configure environment",    cmd:"cp .env.example .env.local",         done:true},
                        {n:"4", title:"Start development server", cmd:"pnpm dev",                           done:false},
                      ].map(s=>(
                        <div key={s.n} className="onboard-step">
                          <div className="step-num">{s.n}</div>
                          <div className="step-body">
                            <p className="step-title">{s.title}</p>
                            <p className="step-cmd">{s.cmd}</p>
                          </div>
                          {s.done && <div className="step-done">✓</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── DARK SECTION ── */}
        <section className="lp-dark">
          <div className="dark-inner">
            <div>
              <p className="dark-label">{'// built for developers'}</p>
              <h2 className="dark-h2">Your codebase,<br />finally <em>legible</em></h2>
              <p className="dark-desc">
                Whether you&apos;re onboarding onto a new team, exploring open-source, or briefing a collaborator — RepoBrief turns thousands of lines into one clear, structured document.
              </p>
              <Link href="/auth" className="btn-coral">{GH_ICON} Get started free</Link>
            </div>
            <div className="dark-feats">
              {[
                {icon:"◎", title:"Repository description",  desc:"A jargon-free summary of what the project does and who it\u2019s for."},
                {icon:"◈", title:"Architecture diagram",    desc:"Mermaid flowchart showing how modules, routes, and services connect."},
                {icon:"◉", title:"File map",                desc:"The 15 most important files, each annotated with their purpose."},
                {icon:"◐", title:"Onboarding guide",        desc:"Step-by-step setup with commands, env vars, and gotchas."},
                {icon:"◑", title:"Live streaming output",   desc:"Watch the brief build in real time — no loading spinner."},
                {icon:"◒", title:"Markdown export",         desc:"Copy the full brief as Markdown to paste anywhere."},
              ].map(f=>(
                <div key={f.title} className="dark-feat">
                  <div className="dark-feat-icon">{f.icon}</div>
                  <div className="dark-feat-info">
                    <p className="dark-feat-title">{f.title}</p>
                    <p className="dark-feat-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="lp-pricing">
          <div className="pricing-inner">
            <p className="pricing-label">{'// pricing'}</p>
            <h2 className="pricing-h2">Simple,<br />transparent</h2>
            <div className="pricing-grid">
              <div className="price-card">
                <div className="price-tier">Free</div>
                <div className="price-amount">$0</div>
                <p className="price-period">per month</p>
                <ul className="price-list">
                  {["5 analyses / month","Public repositories","7-day shareable link","Export as Markdown","Live streaming output"].map(f=>(
                    <li key={f} className="price-item on"><span className="price-check">✓</span>{f}</li>
                  ))}
                  {["Private repositories","API access"].map(f=>(
                    <li key={f} className="price-item"><span className="price-cross">✗</span>{f}</li>
                  ))}
                </ul>
                <Link href="/auth" className="price-btn">Get started free</Link>
              </div>
              <div className="price-card pro">
                <div className="price-tier">Pro <span className="coming-badge">coming soon</span></div>
                <div className="price-amount">$9</div>
                <p className="price-period">per month</p>
                <ul className="price-list">
                  {["Unlimited analyses","Public + private repos","Permanent shareable links","Export as Markdown","API access","Priority support","Early access to features"].map(f=>(
                    <li key={f} className="price-item on"><span className="price-check">✓</span>{f}</li>
                  ))}
                </ul>
                <div className="price-btn-disabled">Coming soon</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <Link href="/" className="footer-logo">Repo<em>Brief</em></Link>
          <div className="footer-links">
            <a href="https://github.com/DoganayBalaban/repobrief" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
            <a href="#pricing" className="footer-link">Pricing</a>
          </div>
          <span className="footer-built">built with claude + next.js</span>
        </footer>

      </div>
    </>
  );
}
