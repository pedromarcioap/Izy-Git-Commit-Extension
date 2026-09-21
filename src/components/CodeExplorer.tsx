import React, { useState } from "react";
import { EXTENSION_FILES, ExtensionFile } from "../data/extensionFiles";
import { Copy, Check, FileCode, Download, ExternalLink } from "lucide-react";
import { downloadExtensionZip } from "../utils/zipExporter";

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ExtensionFile>(EXTENSION_FILES[0]);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const handleCopy = (file: ExtensionFile) => {
    navigator.clipboard.writeText(file.content);
    setCopiedFile(file.path);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const lineCount = selectedFile.content.split("\n").length;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-zinc-700" />
            <span>Código-Fonte Completo da Extensão VS Code</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Arquivos prontos para uso com tipagem estrita em TypeScript e suporte nativo ao SDK @google/genai.
          </p>
        </div>

        <button
          onClick={downloadExtensionZip}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Baixar Projeto Completo (.zip)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista Lateral de Arquivos */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2">
            Estrutura de Arquivos ({EXTENSION_FILES.length})
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100 overflow-hidden shadow-xs">
            {EXTENSION_FILES.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3.5 py-3 transition-all flex items-start justify-between gap-2 ${
                  selectedFile.path === file.path
                    ? "bg-zinc-900 text-white"
                    : "hover:bg-zinc-50 text-zinc-800"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-mono font-medium truncate">
                    {file.path}
                  </div>
                  <div
                    className={`text-[11px] truncate mt-0.5 ${
                      selectedFile.path === file.path ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    {file.description}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase shrink-0 ${
                    selectedFile.path === file.path
                      ? "bg-zinc-800 text-zinc-300"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {file.language}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Visualizador de Código */}
        <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
          {/* Header do Arquivo Selecionado */}
          <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-200 font-semibold">{selectedFile.path}</span>
              <span className="text-[11px] text-zinc-500 font-mono">
                {lineCount} linhas
              </span>
            </div>

            <button
              onClick={() => handleCopy(selectedFile)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors text-xs font-medium border border-zinc-700/60"
            >
              {copiedFile === selectedFile.path ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Arquivo</span>
                </>
              )}
            </button>
          </div>

          {/* Descrição contextual */}
          <div className="px-4 py-2 bg-zinc-900/60 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
            {selectedFile.description}
          </div>

          {/* Bloco de Código com Numeração de Linha */}
          <div className="p-4 overflow-x-auto max-h-[600px] font-mono text-xs text-zinc-200 leading-relaxed bg-zinc-950">
            <table className="w-full border-collapse">
              <tbody>
                {selectedFile.content.split("\n").map((line, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/50">
                    <td className="w-12 text-right pr-4 text-zinc-600 select-none text-[11px] align-top">
                      {idx + 1}
                    </td>
                    <td className="whitespace-pre overflow-x-auto text-[12px] font-mono">
                      {line}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
