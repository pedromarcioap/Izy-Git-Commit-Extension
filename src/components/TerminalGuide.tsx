import React, { useState } from "react";
import { Terminal, Copy, Check, Play, ShieldCheck, Box, Wrench } from "lucide-react";

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
          <span>Guia Passo a Passo: Instalação, Compilação e Depuração Local (F5)</span>
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Siga as etapas abaixo no terminal do seu sistema operacional para inicializar e testar a extensão no VS Code.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Passo 1 - Criar pasta e arquivos */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">
              Criar Diretório e Estrutura Inicial
            </h3>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Crie a pasta do projeto e certifique-se de que os arquivos gerados (<code>package.json</code>, <code>tsconfig.json</code>, <code>src/extension.ts</code> e <code>src/git.d.ts</code>) estejam salvos na estrutura correspondente:
          </p>
          <CommandBlock
            description="Criar pasta e navegar até ela"
            command={`mkdir gemini-git-commit\ncd gemini-git-commit\nmkdir src .vscode`}
          />
        </div>

        {/* Passo 2 - Instalar dependências */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">
              Instalação das Dependências
            </h3>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Instale o SDK oficial do Google Gen AI (<code>@google/genai</code>), os tipos do VS Code e o bundler ultrarrápido <code>esbuild</code>:
          </p>
          <CommandBlock
            description="Instalar pacotes npm"
            command={`npm install`}
          />
        </div>

        {/* Passo 3 - Compilar o projeto */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">
              Compilação e Empacotamento
            </h3>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Execute a compilação com <code>esbuild</code> para gerar o arquivo bundle único em <code>dist/extension.js</code>:
          </p>
          <CommandBlock
            description="Compilar via script package"
            command={`npm run package`}
          />
          <p className="text-[11px] text-zinc-500">
            Dica: Para compilação contínua durante alterações, use <code>npm run watch</code> em outro terminal.
          </p>
        </div>

        {/* Passo 4 - Iniciar depuração F5 */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">
              4
            </span>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">
              Depuração com F5 no VS Code
            </h3>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Abra a pasta do projeto no VS Code e inicie a execução:
          </p>
          <ul className="text-xs text-zinc-600 space-y-1.5 list-none">
            <li>- Abra a pasta do projeto: <code>code .</code></li>
            <li>- Pressione a tecla <strong>F5</strong> (ou menu Executar -&gt; Iniciar Depuração).</li>
            <li>- Uma nova janela intitulada <strong>[Extension Development Host]</strong> será aberta automaticamente.</li>
          </ul>
        </div>
      </div>

      {/* Seção com Instruções de Teste no Extension Host */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
          <Play className="w-4 h-4 text-emerald-600" />
          <span>Como Testar a Extensão na Janela de Depuração</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
            <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <span>Passo A: Abrir Repositório Git</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              Na janela de desenvolvimento aberta pelo F5, abra qualquer pasta que seja um repositório Git com alterações pendentes (ou execute <code>git init</code>).
            </p>
          </div>

          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
            <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <span>Passo B: Clicar no $(sparkle)</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              Abra a aba Source Control (Ctrl+Shift+G / Cmd+Shift+G). No topo da barra de título do Git, clique no ícone de faísca <code>$(sparkle)</code>.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
            <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <span>Passo C: Menu de Contexto (Botão Direito)</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              Clique com o botão direito sobre qualquer arquivo modificado ou sobre o grupo <code>Staged Changes</code> e selecione <code>Gerar Mensagem de Commit com IA</code>.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
            <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <span>Passo D: Seleção de Modelos</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              Clique no item <code>$(sparkle) gemini-2.5-flash</code> na Barra de Status inferior ou execute <code>Ctrl+Shift+P -&gt; Gemini Commit: Selecionar Modelo de IA</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Seção Empacotamento VSIX */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
          <Box className="w-4 h-4 text-zinc-700" />
          <span>Gerar Pacote de Instalação Local (.vsix)</span>
        </h3>
        <p className="text-xs text-zinc-600">
          Para instalar a extensão no seu VS Code de produção sem precisar da depuração F5:
        </p>
        <CommandBlock
          description="Gerar arquivo .vsix com a ferramenta oficial vsce"
          command={`npx @vscode/vsce package\ncode --install-extension gemini-git-commit-1.0.0.vsix`}
        />
      </div>
    </div>
  );
};
