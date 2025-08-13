import fs from "fs";
import path from "path";
import DocWithToc from "../TECHNICAL_DOCUMENTATION/DocWithToc";

// Helper: tries multiple case variations for file names
function readFirstExisting(paths: string[]) {
  for (const p of paths) {
    try {
      return fs.readFileSync(p, "utf-8");
    } catch {
      // Try next path
    }
  }
  throw new Error(
    `User Guide markdown not found. Tried: ${paths.map((p) => p.replace(process.cwd(), ".")).join(", ")}`
  );
}

export default function UserGuidePage() {
  const base = path.join(process.cwd(), "docs");
  const fileContent = readFirstExisting([
    path.join(base, "USER_GUIDE.md"),
    path.join(base, "user_guide.md"),
    path.join(base, "User_Guide.md"),
  ]);

  return <DocWithToc md={fileContent} />;
}
