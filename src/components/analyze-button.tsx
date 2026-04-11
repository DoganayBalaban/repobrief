"use client";

import { useTransition, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { parseAnalysisXml, type AnalysisResult } from "@/lib/analyze";
import { MermaidDiagram } from "@/components/mermaid-diagram";

interface Props {
  owner: string;
  repo: string;
}

interface TechItem {
  name: string;
  category: string;
  version?: string;
}

function parseTechStack(raw: string): TechItem[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const CATEGORY_STYLES: Record<string, string> = {
  language:  "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  framework: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  database:  "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  devops:    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  auth:      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  testing:   "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
  other:     "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

function categoryStyle(category: string): string {
  return CATEGORY_STYLES[category.toLowerCase()] ?? CATEGORY_STYLES["other"];
}

export function AnalyzeButton({ owner, repo }: Props) {
  const [isPending, startTransition] = useTransition();
  const [streamText, setStreamText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function handleCancel() {
    abortRef.current?.abort();
  }

  function handleAnalyze() {
    setError(null);
    setResult(null);
    setStreamText("");

    const controller = new AbortController();
    abortRef.current = controller;

    startTransition(async () => {
      let res: Response;
      try {
        res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ owner, repo }),
          signal: controller.signal,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Network error. Please try again.");
        return;
      }

      if (!res.ok) {
        const data: unknown = await res.json().catch(() => ({}));
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Request failed.";
        setError(message);
        return;
      }

      const stream = res.body;
      if (!stream) {
        setError("No response stream.");
        return;
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let full = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (controller.signal.aborted) {
            await reader.cancel();
            break;
          }
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            full += chunk;
            setStreamText(full);
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Stream interrupted. Please try again.");
        return;
      }

      if (controller.signal.aborted) return;

      full += decoder.decode();
      setStreamText(full);
      setResult(parseAnalysisXml(full));
      setStreamText("");
    });
  }

  const showStreaming =
    isPending || (streamText.length > 0 && result === null && !error);

  const [copied, setCopied] = useState(false);

  function handleExport(r: AnalysisResult, o: string, rep: string) {
    const lines: string[] = [
      `# ${o}/${rep} — RepoBrief Analysis`,
      "",
    ];

    if (r.description) {
      lines.push("## Description", "", r.description, "");
    }
    if (r.architecture) {
      lines.push("## Architecture", "", "```mermaid", r.architecture, "```", "");
    }
    if (r.file_map) {
      lines.push("## File Map", "", r.file_map, "");
    }
    if (r.onboarding) {
      lines.push("## Getting Started", "", r.onboarding, "");
    }
    if (r.tech_stack) {
      try {
        const items = JSON.parse(r.tech_stack) as TechItem[];
        if (items.length > 0) {
          lines.push("## Tech Stack", "");
          lines.push(...items.map((t) => `- **${t.name}**${t.version ? ` ${t.version}` : ""} _(${t.category})_`));
          lines.push("");
        }
      } catch { /* skip */ }
    }

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${o}-${rep}-repobrief.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button onClick={handleAnalyze} disabled={isPending} className="w-fit">
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Analyzing…
            </span>
          ) : (
            "Analyze with Claude"
          )}
        </Button>
        {isPending && (
          <Button variant="ghost" size="sm" onClick={handleCancel} className="text-muted-foreground">
            Cancel
          </Button>
        )}
        {result && !isPending && (
          <>
            <Button variant="outline" size="sm" onClick={handleShare}>
              {copied ? "Copied!" : "Share"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport(result, owner, repo)}>
              Export MD
            </Button>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {showStreaming && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Live output</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[min(70vh,32rem)] overflow-y-auto rounded-lg bg-muted p-4 text-xs font-mono whitespace-pre-wrap break-words leading-relaxed">
                {streamText.length === 0 ? (
                  <span className="text-muted-foreground">Starting…</span>
                ) : (
                  <>
                    {streamText}
                    <span className="animate-cursor-blink ml-px">▋</span>
                  </>
                )}
              </pre>
            </CardContent>
          </Card>

          {/* Skeleton placeholders shown while streaming */}
          <div className="flex flex-col gap-6">
            {["Description", "Tech Stack", "Architecture", "File Map", "Getting Started"].map((label) => (
              <Card key={label}>
                <CardHeader>
                  <CardTitle className="text-sm">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="h-3 w-full rounded-md bg-muted animate-pulse" />
                    <div className="h-3 w-4/5 rounded-md bg-muted animate-pulse" />
                    <div className="h-3 w-3/5 rounded-md bg-muted animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {result && (
        <div className="flex flex-col gap-6">
          {result.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {result.description}
                </p>
              </CardContent>
            </Card>
          )}

          {result.tech_stack && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tech Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {parseTechStack(result.tech_stack).map((item, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${categoryStyle(item.category)}`}
                    >
                      {item.name}
                      {item.version ? (
                        <span className="opacity-60">{item.version}</span>
                      ) : null}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.architecture && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <MermaidDiagram chart={result.architecture} />
              </CardContent>
            </Card>
          )}

          {result.file_map && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">File Map</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-1.5">
                  {result.file_map
                    .split("\n")
                    .filter(Boolean)
                    .map((line, i) => {
                      const [path, ...rest] = line.split("→");
                      return (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="font-mono text-xs text-muted-foreground shrink-0 pt-0.5">
                            {path?.trim()}
                          </span>
                          {rest.length > 0 && (
                            <>
                              <Separator orientation="vertical" className="h-auto" />
                              <span className="text-muted-foreground text-xs">
                                {rest.join("→").trim()}
                              </span>
                            </>
                          )}
                        </li>
                      );
                    })}
                </ul>
              </CardContent>
            </Card>
          )}

          {result.onboarding && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {result.onboarding}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
