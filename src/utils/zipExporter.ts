import JSZip from "jszip";
import { EXTENSION_FILES } from "../data/extensionFiles";

export async function downloadExtensionZip(): Promise<void> {
  const zip = new JSZip();

  for (const file of EXTENSION_FILES) {
    zip.file(file.path, file.content);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gemini-git-commit-extension.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
