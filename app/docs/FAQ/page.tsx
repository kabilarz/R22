import fs from "fs";
import path from "path";
import DocWithToc from "../TECHNICAL_DOCUMENTATION/DocWithToc";

// Helper: read the first markdown file that exists (handles case differences)
function readFirstExisting(paths: string[]) {
  for (const p of paths) {
    try {
      return fs.readFileSync(p, "utf-8");
    } catch {
      // keep trying
    }
  }
  throw new Error(
    `FAQ markdown not found. Tried: ${paths.map((p) => p.replace(process.cwd(), ".")).join(", ")}`
  );
}

export default function FAQPage() {
  const base = path.join(process.cwd(), "docs");
  const fileContent = readFirstExisting([
    path.join(base, "FAQ.md"),
    path.join(base, "faq.md"),
    path.join(base, "Faq.md"),
  ]);

  return <DocWithToc md={fileContent} />;
}
