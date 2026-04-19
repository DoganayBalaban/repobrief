"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function parseGitHubInput(input: string): { owner: string; repo: string } | null {
  const t = input.trim().replace(/\/$/, "");
  const urlMatch = t.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };
  const shortMatch = t.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (shortMatch) return { owner: shortMatch[1], repo: shortMatch[2] };
  return null;
}

const EXAMPLES = [
  "vercel/next.js",
  "facebook/react",
  "django/django",
  "golang/go",
];

export function DashRepoInput({ basePath = "/dashboard" }: { basePath?: string }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseGitHubInput(value);
    if (!parsed) {
      setError("Enter a GitHub URL or owner/repo");
      return;
    }
    setError("");
    router.push(`${basePath}/${parsed.owner}/${parsed.repo}`);
  }

  function fillExample(ex: string) {
    setValue(ex);
    setError("");
  }

  return (
    <div className="dri-wrap">
      <form onSubmit={handleSubmit} className="dri-form">
        <div className={`dri-row${error ? " dri-row--error" : ""}`}>
          <span className="dri-prefix">github.com/</span>
          <input
            className="dri-input"
            type="text"
            value={value}
            onChange={e => { setValue(e.target.value); setError(""); }}
            placeholder="owner/repo or full URL"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" className="dri-btn">
            analyze →
          </button>
        </div>
        {error && <p className="dri-error">{error}</p>}
      </form>

      <div className="dri-examples">
        <span className="dri-examples-label">try</span>
        {EXAMPLES.map(ex => (
          <button key={ex} className="dri-pill" onClick={() => fillExample(ex)}>
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
