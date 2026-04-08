"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { analyzeRepoAction } from "@/app/dashboard/[owner]/[repo]/actions";
import type { AnalysisResult } from "@/lib/analyze";

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
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleAnalyze() {
    setError(null);
    startTransition(async () => {
      const res = await analyzeRepoAction(owner, repo);
      if ("error" in res) {
        setError(res.error);
      } else {
        setResult(res.data);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
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

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {result && (
        <div className="flex flex-col gap-6">
          {/* Description */}
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

          {/* Tech Stack */}
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

          {/* Architecture */}
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

          {/* File Map */}
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

          {/* Onboarding */}
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
