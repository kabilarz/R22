import fs from "fs";
import path from "path";
import DocWithToc from "./DocWithToc";

export default function TechnicalDocumentationPage() {
  const filePath = path.join(process.cwd(), "docs", "TECHNICAL_DOCUMENTATION.md");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return <DocWithToc md={fileContent} />;
}
