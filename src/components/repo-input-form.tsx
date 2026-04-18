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

export function RepoInputForm({ basePath = "/public", theme = "dark" }: { basePath?: string; theme?: "dark" | "light" }) {
  const isLight = theme === "light";
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
            background: isLight ? "#ffffff" : "rgba(255,255,255,0.04)",
            border: isLight ? "1px solid rgba(0,0,0,0.14)" : "1px solid rgba(255,255,255,0.1)",
            borderRight: "none",
            borderRadius: "8px 0 0 8px",
            padding: "12px 16px",
            fontFamily: "ui-monospace, monospace",
            fontSize: 13,
            color: isLight ? "#0f0e0d" : "#f4f4f5",
            outline: "none",
            boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
          }}
        />
        <button
          type="submit"
          style={{
            background: isLight ? "#0f0e0d" : "#a3e635",
            color: isLight ? "#fff" : "#000",
            border: "none",
            borderRadius: "0 8px 8px 0",
            padding: "12px 20px",
            fontFamily: "ui-monospace, monospace",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
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
