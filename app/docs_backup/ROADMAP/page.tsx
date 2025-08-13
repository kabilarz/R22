import fs from "fs";
import path from "path";
import DocWithToc from "../TECHNICAL_DOCUMENTATION/DocWithToc";

// Helper: tries multiple case variations for file names
function readFirstExisting(paths: string[]) {
  for (const p of paths) {
    try {
      return fs.readFileSync(p, "utf-8");
    } catch {
      // keep trying other variations
    }
  }
  throw new Error(
    `Roadmap markdown not found. Tried: ${paths.map((p) => p.replace(process.cwd(), ".")).join(", ")}`
  );
}

export default function RoadmapPage() {
  const base = path.join(process.cwd(), "docs");
  const fileContent = readFirstExisting([
    path.join(base, "ROADMAP.md"),
    path.join(base, "roadmap.md"),
    path.join(base, "Roadmap.md"),
  ]);

  return <DocWithToc md={fileContent} />;
}
