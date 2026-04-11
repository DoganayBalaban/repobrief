export interface AnalysisResult {
  description: string;
  architecture: string;
  file_map: string;
  onboarding: string;
  tech_stack: string;
  raw: string;
}

function extractXml(tag: string, text: string): string {
  const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].trim() : "";
}

export function parseAnalysisXml(raw: string): AnalysisResult {
  return {
    description: extractXml("description", raw),
    architecture: extractXml("architecture", raw),
    file_map: extractXml("file_map", raw),
    onboarding: extractXml("onboarding", raw),
    tech_stack: extractXml("tech_stack", raw),
    raw,
  };
}
