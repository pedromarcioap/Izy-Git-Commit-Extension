import React from "react";
import { Download, Sparkles, Terminal, Code2, Play } from "lucide-react";
import { downloadExtensionZip } from "../utils/zipExporter";

interface HeaderProps {
  activeTab: "simulator" | "code" | "guide";
  setActiveTab: (tab: "simulator" | "code" | "guide") => void;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isGenerating }) => {
  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-mono text-sm font-semibold shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900 text-base tracking-tight">
                  Izy Git Commit
                </span>
                <span className="px-2 py-0.5 text-xs font-mono bg-zinc-100 text-zinc-700 rounded border border-zinc-200">
                  VS Code Extension
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-mono bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                  gemini-2.5-flash
                </span>
              </div>
              <p className="text-xs text-zinc-500 hidden md:block">
                Integração nativa com vscode.git, Conventional Commits e SecretStorage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <nav className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200 text-xs font-medium">
              <button
                id="tab-simulator"
                onClick={() => setActiveTab("simulator")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === "simulator"
                    ? "bg-white text-zinc-900 shadow-xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Play className="w-3.5 h-3.5 text-zinc-700" />
                <span>Simulador SCM</span>
              </button>

              <button
                id="tab-code"
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === "code"
                    ? "bg-white text-zinc-900 shadow-xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-zinc-700" />
                <span>Arquivos do Código</span>
              </button>

              <button
                id="tab-guide"
                onClick={() => setActiveTab("guide")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === "guide"
                    ? "bg-white text-zinc-900 shadow-xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-zinc-700" />
                <span>Guia de Execução F5</span>
              </button>
            </nav>

            <button
              id="btn-download-zip"
              onClick={downloadExtensionZip}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-xs"
              title="Baixar projeto completo pronto para abrir no VS Code"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
