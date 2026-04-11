"use client";

import { useTransition, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { parseAnalysisXml, type AnalysisResult } from "@/lib/analyze";

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
                    <Badge key={i} variant="secondary">
                      {item.name}
                      {item.version ? ` ${item.version}` : ""}
                    </Badge>
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
                <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                  {result.architecture}
                </pre>
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
