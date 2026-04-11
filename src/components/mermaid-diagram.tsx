"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import DOMPurify from "dompurify";

mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  securityLevel: "loose",
});

let idCounter = 0;

interface Props {
  chart: string;
}

export function MermaidDiagram({ chart }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  const idRef = useRef(`mermaid-${++idCounter}`);

  useEffect(() => {
    if (!chart.trim() || !containerRef.current) return;
    setError(false);
    setReady(false);

    mermaid
      .render(idRef.current, chart)
      .then(({ svg }) => {
        if (containerRef.current) {
          // Sanitize mermaid SVG output before injecting into DOM
          const clean = DOMPurify.sanitize(svg, {
            USE_PROFILES: { svg: true, svgFilters: true },
          });
          containerRef.current.innerHTML = clean;
          setReady(true);
        }
      })
      .catch(() => {
        setError(true);
      });
  }, [chart]);

  if (error) {
    return (
      <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap text-muted-foreground">
        {chart}
      </pre>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-muted p-4">
      {!ready && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Rendering diagram…
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}
