import React, { useState } from "react";
import { Terminal, Copy, Check, Play, Box, Globe, Sparkles } from "lucide-react";

interface CommandBlockProps {
  command: string;
  description: string;
}

const CommandBlock: React.FC<CommandBlockProps> = ({ command, description }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs font-mono">
      <div className="flex items-center justify-between text-zinc-400 mb-2">
        <span className="text-[11px] text-zinc-400">{description}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800"
          title="Copiar comando"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? "Copiado" : "Copiar"}</span>
        </button>
      </div>
      <div className="text-emerald-400 overflow-x-auto whitespace-pre selection:bg-emerald-900">
        {command}
      </div>
    </div>
  );
};

export const TerminalGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-700" />
          <span>Guia Passo a Passo: Instalação, Compilação e Empacotamento (.vsix)</span>
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Siga as etapas abaixo para compilar a extensão e gerar o pacote <code className="text-zinc-800 font-mono">.vsix</code> para o VS Code ou Antigravity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Passo 1 - Dependências */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">
              Instalação das Dependências
            </h3>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Navegue até a pasta da extensão e instale as dependências:
          </p>
          <CommandBlock
            description="Instalar pacotes no diretório do projeto"
            command={`npm install`}
          />
        </div>

        {/* Passo 2 - Compilar o projeto */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">
              Compilar com esbuild
            </h3>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Execute a compilação do TypeScript gerando o bundle único em <code>dist/extension.js</code>:
          </p>
          <CommandBlock
            description="Compilar bundle de produção"
            command={`npm run package`}
          />
        </div>

        {/* Passo 3 - Empacotar VSIX */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">
              Gerar Pacote .vsix
            </h3>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Gere o arquivo binário instalável <code className="font-mono">.vsix</code> com a ferramenta oficial:
          </p>
          <CommandBlock
            description="Gerar instalador .vsix"
            command={`npx @vscode/vsce package`}
          />
          <p className="text-[11px] text-zinc-500">
            Dica: Se perguntar sobre prosseguir sem repositório git remoto, digite <code>y</code> ou use <code>--allow-missing-repository</code>.
          </p>
        </div>

        {/* Passo 4 - Instalar no Antigravity / VS Code */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">
              4
            </span>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">
              Instalar no Antigravity / VS Code
            </h3>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            No Antigravity ou VS Code, instale diretamente pela interface gráfica ou CLI:
          </p>
          <ul className="text-xs text-zinc-600 space-y-1.5 list-none">
            <li>- Abra o menu de Extensões (<code>Ctrl+Shift+X</code>).</li>
            <li>- Clique no menu de 3 pontinhos (...) no topo do painel de extensões.</li>
            <li>- Selecione <strong>"Install from VSIX..."</strong> e escolha o arquivo gerado.</li>
          </ul>
        </div>
      </div>

      {/* Seção com Instruções de Modelos Suportados */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-600" />
          <span>Modelos e Provedores Suportados</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1.5">
            <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <span>DeepSeek R1 / V3</span>
            </div>
            <p className="text-zinc-600 leading-relaxed text-[11px]">
              Disponível via <strong>OpenRouter</strong> (<code>deepseek/deepseek-r1</code>) ou API direta da DeepSeek.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1.5">
            <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <span>Qwen 2.5 Coder 32B</span>
            </div>
            <p className="text-zinc-600 leading-relaxed text-[11px]">
              Especializado em código via <strong>OpenRouter</strong> (<code>qwen/qwen-2.5-coder-32b-instruct</code>) ou Ollama local.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1.5">
            <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <span>Claude 3.7 Sonnet</span>
            </div>
            <p className="text-zinc-600 leading-relaxed text-[11px]">
              Flagship da Anthropic com raciocínio híbrido via OpenRouter ou API direta.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1.5">
            <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <span>Google Gemini</span>
            </div>
            <p className="text-zinc-600 leading-relaxed text-[11px]">
              Gemini 2.5 Flash, 3.8 Flash e Gemini 3.1 Pro com chave gratuita do Google AI Studio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
