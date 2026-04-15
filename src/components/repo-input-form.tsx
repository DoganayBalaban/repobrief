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

export function RepoInputForm() {
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
    router.push(`/public/${parsed.owner}/${parsed.repo}`);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <div style={{ display: "flex" }}>
        <input
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(""); }}
          placeholder="github.com/owner/repo"
          autoComplete="off"
          spellCheck={false}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRight: "none",
            borderRadius: "3px 0 0 3px",
            padding: "10px 14px",
            fontFamily: "ui-monospace, monospace",
            fontSize: 12,
            color: "#f4f4f5",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            background: "#a3e635",
            color: "#000",
            border: "none",
            borderRadius: "0 3px 3px 0",
            padding: "10px 18px",
            fontFamily: "ui-monospace, monospace",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          analyze →
        </button>
      </div>
      {error && (
        <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "#ef4444", margin: 0 }}>
          {error}
        </p>
      )}
    </form>
  );
}
