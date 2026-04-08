import type { TreeFile } from "./file-tree";
import type { FileContent } from "./file-content";

interface RepoMetadata {
  owner: string;
  repo: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  default_branch: string;
}

const SYSTEM_PROMPT = `Sen bir kod analiz uzmanısın. Sana bir GitHub reposunun dosya yapısı ve önemli dosyaların içerikleri verilecek. Bu repoyu derinlemesine analiz et.

Yanıtını YALNIZCA aşağıdaki XML formatında ver. XML dışında hiçbir şey yazma:

<description>
Projenin ne yaptığını anlatan 2-3 paragraf. Teknik olmayan kullanıcıların da anlayabileceği netlikte yaz.
</description>

<architecture>
Mermaid.js graph TD formatında mimari diyagram. Sadece diyagram kodunu yaz, başka açıklama ekleme.
Örnek format:
graph TD
  A[Client] --> B[Next.js App]
  B --> C[API Routes]
</architecture>

<file_map>
Her satırda bir dosya ve ne işe yaradığı. Format: "path/to/file.ts → açıklama"
Sadece önemli dosyaları listele, node_modules vb. dahil etme.
</file_map>

<onboarding>
Projeye katkıda bulunmak isteyen bir geliştirici için adım adım başlangıç rehberi. Kurulum, geliştirme ortamı, ilk katkı adımlarını içersin.
</onboarding>

<tech_stack>
Tespit edilen teknolojilerin JSON array'i. Her eleman: {"name": "...", "category": "...", "version": "..."}
Kategoriler: language, framework, database, auth, testing, devops, other
</tech_stack>`;

export function buildPrompt(
  meta: RepoMetadata,
  fileTree: TreeFile[],
  fileContents: FileContent[]
): { system: string; user: string } {
  const fileTreeText = fileTree
    .map((f) => f.path)
    .slice(0, 150)
    .join("\n");

  const fileContentsText = fileContents
    .sort((a, b) => b.score - a.score)
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join("\n\n");

  const user = `REPO: ${meta.owner}/${meta.repo}
AÇIKLAMA: ${meta.description ?? "belirtilmemiş"}
ANA DİL: ${meta.language ?? "belirtilmemiş"}
YILDIZ: ${meta.stargazers_count}
ANA BRANCH: ${meta.default_branch}

DOSYA AĞACI:
${fileTreeText}

ÖNEMLI DOSYA İÇERİKLERİ:
${fileContentsText}`;

  return { system: SYSTEM_PROMPT, user };
}
