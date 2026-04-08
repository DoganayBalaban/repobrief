import type { TreeFile } from "./file-tree";

export interface ScoredFile extends TreeFile {
  score: number;
}

const SCORE_RULES: Array<{ pattern: RegExp; points: number }> = [
  // P0 — dependency manifests
  { pattern: /^(package\.json|pyproject\.toml|Cargo\.toml|go\.mod|composer\.json|build\.gradle(\.kts)?)$/i, points: 40 },

  // P0 — README
  { pattern: /^README(\.\w+)?$/i, points: 35 },

  // P1 — entry points
  { pattern: /(^|\/)((index|main|app|server|start)\.(ts|tsx|js|jsx|py|go|rs|rb))$/i, points: 30 },

  // P1 — infra
  { pattern: /(^|\/)(docker-compose(\.\w+)?\.ya?ml|Dockerfile(\.\w+)?)$/i, points: 25 },

  // P1 — config files
  { pattern: /(^|\/)(\.(env\.example|env\.sample)|config\.(ts|js|json|yaml|yml)|tsconfig\.json|next\.config\.(ts|js|mjs)|vite\.config\.(ts|js))$/i, points: 20 },

  // P1 — schema / data model
  { pattern: /(^|\/)(schema\.prisma|.*\.prisma|(migrations?|schema)\/)/, points: 20 },

  // P2 — routers / controllers
  { pattern: /(^|\/)(routes?|routers?|controllers?|handlers?)[\\/]/, points: 15 },
  { pattern: /(^|\/)(route|router|controller|handler)\.(ts|tsx|js|jsx|py|go)$/i, points: 15 },

  // P3 — tests (useful but lower priority)
  { pattern: /\.(test|spec)\.(ts|tsx|js|jsx|py)$/i, points: 10 },

  // Ignored — always negative
  { pattern: /(^|\/)node_modules\//, points: -100 },
  { pattern: /(^|\/)(dist|build|out|\.next|\.turbo|coverage)\//i, points: -100 },
  { pattern: /(^|\/)\.(git|cache|nyc_output)\//, points: -100 },
];

const CHAR_LIMITS: Record<string, number> = {
  "README": 3000,
  "package.json": 2000,
  "pyproject.toml": 2000,
  "go.mod": 2000,
  "Cargo.toml": 2000,
  "default": 1000,
};

export function getCharLimit(path: string): number {
  const filename = path.split("/").pop() ?? "";
  if (/^README/i.test(filename)) return CHAR_LIMITS["README"];
  return CHAR_LIMITS[filename] ?? CHAR_LIMITS["default"];
}

export function scoreFile(file: TreeFile): ScoredFile {
  let score = 0;
  for (const rule of SCORE_RULES) {
    if (rule.pattern.test(file.path)) {
      score += rule.points;
    }
  }
  return { ...file, score };
}

export function selectKeyFiles(files: TreeFile[], maxFiles = 15): ScoredFile[] {
  return files
    .map(scoreFile)
    .filter((f) => f.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxFiles);
}
