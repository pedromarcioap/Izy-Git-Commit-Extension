import React, { useState } from "react";
import { Header } from "./components/Header";
import { VsCodeSimulator } from "./components/VsCodeSimulator";
import { CodeExplorer } from "./components/CodeExplorer";
import { TerminalGuide } from "./components/TerminalGuide";
import { Sparkles, Terminal, Code2, Play, GitBranch, ShieldCheck } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"simulator" | "code" | "guide">("simulator");
  const [isGenerating] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isGenerating={isGenerating}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Banner de Contexto de Engenharia */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 text-sm">
                Extensão VS Code: Izy Git Commit Generator
              </span>
              <span className="px-2 py-0.5 text-[11px] font-mono bg-zinc-100 text-zinc-700 rounded border border-zinc-200">
                Conventional Commits
              </span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed max-w-3xl">
              Arquitetura de extensão com integração profunda à API integrada <code>vscode.git</code>, persistência criptografada de credenciais com <code>vscode.SecretStorage</code> e modelo <code>gemini-2.5-flash</code> via SDK oficial <code>@google/genai</code>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 rounded-md text-zinc-700 text-xs font-mono border border-zinc-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cofre SecretStorage Ativo</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 rounded-md text-zinc-700 text-xs font-mono border border-zinc-200">
              <GitBranch className="w-3.5 h-3.5 text-zinc-600" />
              <span>Fallback Staged / Unstaged</span>
            </div>
          </div>
        </div>

        {/* Conteúdo Dinâmico por Aba */}
        {activeTab === "simulator" && <VsCodeSimulator />}
        {activeTab === "code" && <CodeExplorer />}
        {activeTab === "guide" && <TerminalGuide />}
      </main>

      <footer className="border-t border-zinc-200 bg-white py-5 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Izy Git Commit - Extensão VS Code com TypeScript</span>
          <span>Modelo: gemini-2.5-flash - API: @google/genai</span>
        </div>
      </footer>
    </div>
  );
}
