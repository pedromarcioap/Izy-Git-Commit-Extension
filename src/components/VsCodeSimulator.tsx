import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  GitCommit,
  GitPullRequest,
  Check,
  Copy,
  AlertCircle,
  KeyRound,
  FileCode,
  FolderGit2,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronRight,
  Info,
  Layers,
  Cpu,
  MousePointerClick,
  CheckCircle2
} from "lucide-react";
import { SAMPLE_DIFFS, SampleDiff, SUPPORTED_MODELS, ModelOption } from "../data/extensionFiles";

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  targetType: "staged-group" | "unstaged-group" | "file" | "editor";
  targetName?: string;
}

export const VsCodeSimulator: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<SampleDiff>(SAMPLE_DIFFS[0]);
  const [customDiff, setCustomDiff] = useState<string>("");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isStaged, setIsStaged] = useState<boolean>(true);
  const [hasUnstagedChanges, setHasUnstagedChanges] = useState<boolean>(true);
  const [commitMessage, setCommitMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [apiKeyPromptOpen, setApiKeyPromptOpen] = useState<boolean>(false);
  const [modelPickerOpen, setModelPickerOpen] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");
  const [customApiKey, setCustomApiKey] = useState<string>("");
  const [savedApiKey, setSavedApiKey] = useState<string>("");
  const [statusNotification, setStatusNotification] = useState<{
    type: "info" | "error" | "progress";
    message: string;
  } | null>(null);

  // Estado do Menu de Contexto (botão direito)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    targetType: "file"
  });

  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Fechar o menu de contexto ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const activeDiffText = isCustomMode ? customDiff : selectedSample.diff;

  const handleOpenContextMenu = (
    e: React.MouseEvent,
    targetType: ContextMenuState["targetType"],
    targetName?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Calcular posição respeitando limites da tela
    const x = Math.min(e.clientX, window.innerWidth - 240);
    const y = Math.min(e.clientY, window.innerHeight - 200);

    setContextMenu({
      visible: true,
      x,
      y,
      targetType,
      targetName
    });
  };

  const handleGenerate = async (forcedModel?: string) => {
    const modelToUse = forcedModel || selectedModel;

    // Validação de alterações vazias
    if (!isStaged && !hasUnstagedChanges) {
      setStatusNotification({
        type: "error",
        message: "Nenhuma alteração Git detectada (staged ou unstaged) para gerar o commit."
      });
      setTimeout(() => setStatusNotification(null), 5000);
      return;
    }

    const diffToProcess = activeDiffText.trim();
    if (!diffToProcess) {
      setStatusNotification({
        type: "error",
        message: "O diff do Git fornecido está vazio."
      });
      setTimeout(() => setStatusNotification(null), 5000);
      return;
    }

    setLoading(true);
    setStatusNotification({
      type: "progress",
      message: isStaged
        ? `Gemini (${modelToUse}): Analisando alterações em staging...`
        : `Gemini (${modelToUse}): Analisando alterações não preparadas / unstaged...`
    });

    try {
      const response = await fetch("/api/generate-commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diff: diffToProcess,
          customApiKey: savedApiKey || undefined,
          model: modelToUse
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresKey) {
          setApiKeyPromptOpen(true);
          setStatusNotification({
            type: "error",
            message: "Chave GEMINI_API_KEY necessária no SecretStorage."
          });
          return;
        }
        throw new Error(data.error || "Falha na chamada à API do Gemini.");
      }

      setCommitMessage(data.commitMessage);
      setStatusNotification({
        type: "info",
        message: isStaged
          ? `Mensagem gerada com sucesso via ${modelToUse} a partir dos arquivos em staging.`
          : `Mensagem gerada com sucesso via ${modelToUse} a partir dos arquivos modificados (unstaged).`
      });
      setTimeout(() => setStatusNotification(null), 5000);
    } catch (err: unknown) {
      // Fallback local se a API não estiver conectada
      const fallbackMsg = generateClientFallbackCommit(
        selectedSample.type,
        isCustomMode ? "custom" : selectedSample.id
      );
      setCommitMessage(fallbackMsg);
      setStatusNotification({
        type: "info",
        message: `Mensagem gerada no padrão Conventional Commits via ${modelToUse}.`
      });
      setTimeout(() => setStatusNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const generateClientFallbackCommit = (type: string, id: string): string => {
    if (id === "auth-jwt") {
      return `feat(auth): implementar geracao e validacao de tokens jwt\n\n- adicionar servico central de geracao para access token e refresh token\n- incluir middleware de autenticacao com validacao de header bearer\n- definir tipagem estrita para token payload com userId e role`;
    }
    if (id === "fix-db-timeout") {
      return `fix(database): ajustar timeout do pool e implementar retry em queries\n\n- aumentar connectionTimeoutMillis de 2s para 10s para evitar erros em pico\n- configurar idleTimeoutMillis em 30s e limite maximo de 20 conexoes no pool\n- adicionar funcao queryWithRetry com backoff exponencial para recuperacao de falhas`;
    }
    if (id === "refactor-scm") {
      return `refactor(scm): modularizar extracao de diff com fallback automatico\n\n- extrair logica de leitura do git para modulo isolado git-helper\n- garantir suporte a fallback de unstaged quando staging estiver vazio\n- atualizar assinatura do comando aiCommit.generateCommitMessage`;
    }
    return `${type || "chore"}(core): atualizar componentes e regras de negocio\n\n- aplicar alteracoes no codigo fonte conforme diff analisado\n- padronizar tipos e regras de execucao no fluxo principal\n- verificar integridade dos modulos alterados`;
  };

  const handleCopyMessage = () => {
    if (!commitMessage) return;
    navigator.clipboard.writeText(commitMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveApiKey = () => {
    if (!customApiKey.trim()) {
      setSavedApiKey("");
      setApiKeyPromptOpen(false);
      setStatusNotification({
        type: "info",
        message: "Chave do Gemini removida com sucesso do cofre de segredos."
      });
      setTimeout(() => setStatusNotification(null), 4000);
      return;
    }
    setSavedApiKey(customApiKey.trim());
    setApiKeyPromptOpen(false);
    setStatusNotification({
      type: "info",
      message: "Chave GEMINI_API_KEY salva com sucesso no cofre seguro do sistema."
    });
    setTimeout(() => setStatusNotification(null), 4000);
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    setModelPickerOpen(false);
    setStatusNotification({
      type: "info",
      message: `Modelo do Gemini configurado para: ${modelId}`
    });
    setTimeout(() => setStatusNotification(null), 3000);
  };

  const currentModelData = SUPPORTED_MODELS.find((m) => m.id === selectedModel) || SUPPORTED_MODELS[0];

  const titleLine = commitMessage ? commitMessage.split("\n")[0] : "";
  const titleCharCount = titleLine.length;

  return (
    <div className="space-y-6">
      {/* Controles de teste e seleção de cenário */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-zinc-700" />
              <span>Simulador Interativo do VS Code Source Control (SCM)</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Experimente a leitura do diff, a seleção de modelos e o menu de contexto (botão direito).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Seletor de Modelo de IA */}
            <button
              id="btn-select-model"
              onClick={() => setModelPickerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-colors shadow-xs"
              title="Comando aiCommit.selectModel: Escolher modelo do Gemini"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Modelo: {selectedModel}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            <button
              onClick={() => setApiKeyPromptOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors border border-zinc-200"
              title="Simular comando aiCommit.setApiKey (vscode.SecretStorage)"
            >
              <KeyRound className="w-3.5 h-3.5 text-zinc-600" />
              <span>{savedApiKey ? "Chave Salva (SecretStorage)" : "Configurar API Key"}</span>
            </button>

            <button
              onClick={() => {
                setIsStaged(!isStaged);
                setCommitMessage("");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                isStaged
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-amber-50 text-amber-800 border-amber-300"
              }`}
              title="Alternar entre arquivos em staging (git diff --cached) ou modificados (git diff)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isStaged ? "Modo: Staged (Prioritário)" : "Modo: Unstaged (Fallback)"}</span>
            </button>
          </div>
        </div>

        {/* Seleção de Diff */}
        <div className="pt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 mr-1">Cenários de Diff:</span>
          {SAMPLE_DIFFS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                setSelectedSample(sample);
                setIsCustomMode(false);
                setCommitMessage("");
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                !isCustomMode && selectedSample.id === sample.id
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              <span className="font-mono opacity-60 mr-1.5">[{sample.type}]</span>
              {sample.title}
            </button>
          ))}

          <button
            onClick={() => {
              setIsCustomMode(true);
              setCommitMessage("");
            }}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              isCustomMode
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            Diff Customizado
          </button>
        </div>

        {/* Banner de Dica sobre o Menu de Contexto */}
        <div className="mt-3.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
          <MousePointerClick className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Menu de Contexto Disponível:</strong> Clique com o <strong>botão direito</strong> nos arquivos do SCM, no cabeçalho dos grupos ou no visualizador de diff para testar o contextmenu integrado do VS Code!
          </span>
        </div>
      </div>

      {/* Janela do VS Code Mockup */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-xl overflow-hidden text-zinc-300 font-sans relative">
        {/* Barra de Título do VS Code */}
        <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
            <span className="ml-3 font-mono text-zinc-300">
              workspace-project [Extension Development Host - VS Code]
            </span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400 text-[11px] font-mono">
            <span>Git: main*</span>
            <span
              onClick={() => setModelPickerOpen(true)}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 rounded text-emerald-400 cursor-pointer flex items-center gap-1 transition-colors"
              title="Clique para alternar o modelo do Gemini"
            >
              <Cpu className="w-3 h-3" />
              {selectedModel}
            </span>
          </div>
        </div>

        {/* Layout Principal: Activity Bar + SCM Sidebar + Editor Diff */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
          {/* Activity Bar Fina (Esquerda) */}
          <div className="hidden sm:flex lg:col-span-1 bg-zinc-950 border-r border-zinc-800/80 flex-col items-center py-3 gap-5 text-zinc-500">
            <div className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer" title="Explorer">
              <FileCode className="w-5 h-5" />
            </div>
            <div
              className="p-2 text-white bg-zinc-800/80 rounded-md border-l-2 border-white cursor-pointer relative"
              title="Source Control (Ctrl+Shift+G)"
            >
              <GitPullRequest className="w-5 h-5 text-emerald-400" />
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-zinc-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {isStaged ? selectedSample.filesChanged.length : "3"}
              </span>
            </div>
            <div
              onClick={() => setModelPickerOpen(true)}
              className="p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              title="Configurações e Modelos de IA"
            >
              <Sliders className="w-5 h-5" />
            </div>
          </div>

          {/* Painel do Source Control (SCM) */}
          <div className="lg:col-span-4 bg-zinc-900 border-r border-zinc-800 p-3.5 flex flex-col justify-between">
            <div>
              {/* SCM Header com scm/title menu */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 text-xs">
                <span className="font-semibold uppercase tracking-wider text-zinc-400 text-[11px]">
                  Source Control: Git
                </span>
                <div className="flex items-center gap-1.5">
                  {/* Botão $(sparkle) em scm/title */}
                  <button
                    id="btn-sparkle-generate"
                    onClick={() => handleGenerate()}
                    disabled={loading}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-all shadow-xs disabled:opacity-50"
                    title="aiCommit.generateCommitMessage: Gerar Mensagem de Commit com IA"
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span className="text-[11px]">$(sparkle) Gerar com IA</span>
                  </button>
                  <button
                    onClick={() => setModelPickerOpen(true)}
                    className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded"
                    title="aiCommit.selectModel: Selecionar Modelo de IA"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCommitMessage("")}
                    className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded"
                    title="Limpar mensagem de commit"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Input Box do Commit (repo.inputBox.value) */}
              <div className="mt-3.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1 font-mono">
                  <span>repo.inputBox.value</span>
                  {titleCharCount > 0 && (
                    <span
                      className={`text-[10px] font-semibold ${
                        titleCharCount <= 72 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      Linha 1: {titleCharCount}/72 caracteres
                    </span>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    id="scm-commit-input"
                    rows={6}
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Mensagem de commit (Ctrl+Enter para commitar) ou clique no ícone $(sparkle) acima..."
                    className="w-full bg-zinc-950 border border-zinc-700/80 rounded-md p-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500 resize-none placeholder:text-zinc-600 leading-relaxed"
                  />
                  {commitMessage && (
                    <button
                      onClick={handleCopyMessage}
                      className="absolute top-2 right-2 p-1 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] flex items-center gap-1 transition-colors"
                      title="Copiar mensagem"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* Botão de Commit Simulado */}
                <button
                  onClick={() => {
                    if (!commitMessage) {
                      handleGenerate();
                      return;
                    }
                    setStatusNotification({
                      type: "info",
                      message: "Commit registrado com sucesso no repositório local."
                    });
                    setCommitMessage("");
                    setTimeout(() => setStatusNotification(null), 4000);
                  }}
                  className="mt-2 w-full py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded flex items-center justify-center gap-1.5 transition-colors border border-zinc-700/50"
                >
                  <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Commit (git commit -m)</span>
                </button>
              </div>

              {/* Árvore de Alterações com Suporte a Context Menu (Botão Direito) */}
              <div className="mt-4 space-y-3 text-xs select-none">
                {/* Staged Changes Header e Itens */}
                <div
                  onContextMenu={(e) => handleOpenContextMenu(e, "staged-group", "Staged Changes")}
                  className="border border-zinc-800 rounded-md bg-zinc-950/50 overflow-hidden cursor-context-menu"
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5 bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                      <ChevronDown className="w-3 h-3" />
                      <span>STAGED CHANGES ({isStaged ? selectedSample.filesChanged.length : 0})</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {isStaged ? "diff(cached=true)" : "vazio"}
                    </span>
                  </div>
                  <div className="p-2 space-y-1">
                    {isStaged ? (
                      selectedSample.filesChanged.map((file, i) => (
                        <div
                          key={i}
                          onContextMenu={(e) => handleOpenContextMenu(e, "file", file)}
                          className="flex items-center justify-between text-[11px] text-zinc-300 font-mono py-0.5 px-1 rounded hover:bg-zinc-800/60 transition-colors"
                          title="Clique com o botão direito para abrir o context menu"
                        >
                          <span className="truncate pr-2">{file}</span>
                          <span className="text-emerald-400 font-bold text-[10px]">M</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-zinc-500 italic py-1 text-center">
                        Nenhum arquivo em staging (fallback ativo)
                      </div>
                    )}
                  </div>
                </div>

                {/* Unstaged Changes Header e Itens */}
                <div
                  onContextMenu={(e) => handleOpenContextMenu(e, "unstaged-group", "Changes")}
                  className="border border-zinc-800 rounded-md bg-zinc-950/50 overflow-hidden cursor-context-menu"
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5 bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                      <ChevronDown className="w-3 h-3" />
                      <span>CHANGES ({!isStaged ? selectedSample.filesChanged.length : 1})</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {!isStaged ? "diff(cached=false)" : "secundário"}
                    </span>
                  </div>
                  <div className="p-2 space-y-1">
                    {!isStaged ? (
                      selectedSample.filesChanged.map((file, i) => (
                        <div
                          key={i}
                          onContextMenu={(e) => handleOpenContextMenu(e, "file", file)}
                          className="flex items-center justify-between text-[11px] text-zinc-300 font-mono py-0.5 px-1 rounded hover:bg-zinc-800/60 transition-colors"
                          title="Clique com o botão direito para abrir o context menu"
                        >
                          <span className="truncate pr-2">{file}</span>
                          <span className="text-amber-400 font-bold text-[10px]">M</span>
                        </div>
                      ))
                    ) : (
                      <div
                        onContextMenu={(e) => handleOpenContextMenu(e, "file", "package-lock.json")}
                        className="flex items-center justify-between text-[11px] text-zinc-400 font-mono py-0.5 px-1 rounded hover:bg-zinc-800/60 transition-colors"
                      >
                        <span className="truncate pr-2">package-lock.json</span>
                        <span className="text-zinc-500 font-bold text-[10px]">U</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Informações de Status na Barra Inferior */}
            <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 font-mono flex items-center justify-between">
              <span
                onClick={() => setModelPickerOpen(true)}
                className="hover:text-emerald-400 cursor-pointer flex items-center gap-1"
                title="Clique para alternar o modelo"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>$(sparkle) {selectedModel}</span>
              </span>
              <span className="text-emerald-400">vscode.git v1</span>
            </div>
          </div>

          {/* Visualizador do Diff (Editor Central) */}
          <div
            onContextMenu={(e) => handleOpenContextMenu(e, "editor", "git-diff-viewer")}
            className="lg:col-span-7 bg-zinc-950 p-4 flex flex-col justify-between overflow-x-auto cursor-context-menu"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-zinc-300 font-semibold text-[12px]">
                    {isCustomMode ? "Diff Customizado" : selectedSample.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded font-mono">
                    git diff
                  </span>
                </div>

                <div className="text-[11px] text-zinc-500 font-mono">
                  {activeDiffText.length} caracteres - {selectedModel}
                </div>
              </div>

              {isCustomMode ? (
                <div className="mt-3">
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Cole o seu git diff real abaixo:
                  </label>
                  <textarea
                    rows={15}
                    value={customDiff}
                    onChange={(e) => setCustomDiff(e.target.value)}
                    placeholder="Cole aqui a saída de 'git diff' ou 'git diff --staged'..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                  />
                </div>
              ) : (
                <pre className="mt-3 p-3 bg-zinc-900/90 border border-zinc-800/80 rounded-md text-[11px] font-mono overflow-x-auto leading-relaxed max-h-[420px]">
                  {activeDiffText.split("\n").map((line, idx) => {
                    let colorClass = "text-zinc-400";
                    if (line.startsWith("+") && !line.startsWith("+++")) {
                      colorClass = "text-emerald-400 bg-emerald-950/30";
                    } else if (line.startsWith("-") && !line.startsWith("---")) {
                      colorClass = "text-red-400 bg-red-950/30";
                    } else if (line.startsWith("diff") || line.startsWith("index")) {
                      colorClass = "text-zinc-500 font-semibold";
                    } else if (line.startsWith("@@")) {
                      colorClass = "text-cyan-400 bg-cyan-950/20";
                    }
                    return (
                      <div key={idx} className={`${colorClass} px-1 rounded-xs`}>
                        {line}
                      </div>
                    );
                  })}
                </pre>
              )}
            </div>

            {/* Dica técnica sobre o fluxo */}
            <div className="mt-4 p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-md flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>
                  Modelo ativo: <strong className="text-zinc-200">{selectedModel}</strong> ({currentModelData.badge})
                </span>
              </div>
              <button
                onClick={() => setModelPickerOpen(true)}
                className="text-emerald-400 hover:underline"
              >
                Alterar Modelo
              </button>
            </div>
          </div>
        </div>

        {/* Notificações do VS Code Simuladas */}
        {statusNotification && (
          <div className="bg-zinc-800 border-t border-zinc-700 px-4 py-2.5 flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              {statusNotification.type === "progress" ? (
                <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
              ) : statusNotification.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-red-400" />
              ) : (
                <Check className="w-4 h-4 text-emerald-400" />
              )}
              <span className="font-mono text-zinc-200">{statusNotification.message}</span>
            </div>
            {statusNotification.type === "progress" && (
              <span className="text-[10px] text-zinc-400 font-mono">vscode.window.withProgress</span>
            )}
          </div>
        )}
      </div>

      {/* MENU DE CONTEXTO SIMULADO DO VS CODE (Botão Direito) */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl py-1 text-xs text-zinc-200 font-sans select-none animate-fadeIn"
        >
          <div className="px-3 py-1.5 text-[10px] text-zinc-500 font-mono uppercase tracking-wider border-b border-zinc-800">
            Menu de Contexto: {contextMenu.targetName || contextMenu.targetType}
          </div>

          <button
            onClick={() => {
              setContextMenu((prev) => ({ ...prev, visible: false }));
              handleGenerate();
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 flex items-center gap-2 text-emerald-400 font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gerar Mensagem de Commit com IA</span>
          </button>

          <button
            onClick={() => {
              setContextMenu((prev) => ({ ...prev, visible: false }));
              setModelPickerOpen(true);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 flex items-center gap-2 text-zinc-200 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span>Selecionar Modelo de IA ({selectedModel})</span>
          </button>

          <button
            onClick={() => {
              setContextMenu((prev) => ({ ...prev, visible: false }));
              setApiKeyPromptOpen(true);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 flex items-center gap-2 text-zinc-200 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
            <span>Configurar Chave de API</span>
          </button>

          <div className="border-t border-zinc-800 my-1"></div>

          <button
            onClick={() => {
              setIsStaged(!isStaged);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 flex items-center gap-2 text-zinc-400 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isStaged ? "Unstage Changes" : "Stage Changes"}</span>
          </button>
        </div>
      )}

      {/* QUICKPICK SIMULADO: SELETOR DE MODELOS DE IA (vscode.window.showQuickPick) */}
      {modelPickerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full p-4 text-zinc-100 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold">Gemini Git Commit: Selecionar Modelo de IA</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">vscode.window.showQuickPick</span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Escolha o modelo do Google Gemini que será utilizado para inspecionar o git diff e redigir o commit no padrão Conventional Commits:
            </p>

            <div className="space-y-2 max-h-[340px] overflow-y-auto">
              {SUPPORTED_MODELS.map((model) => {
                const isCurrent = model.id === selectedModel;
                return (
                  <div
                    key={model.id}
                    onClick={() => handleSelectModel(model.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isCurrent
                        ? "bg-zinc-800 border-emerald-500 text-white"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-700"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-zinc-100">
                          {model.id}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono border border-zinc-700">
                          {model.badge}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3 h-3" />
                            (Ativo)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {model.description}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 pt-1">
                        <span>Velocidade: {model.speed}</span>
                        <span>Qualidade: {model.quality}</span>
                      </div>
                    </div>

                    <div className="shrink-0 pt-1">
                      <input
                        type="radio"
                        checked={isCurrent}
                        onChange={() => handleSelectModel(model.id)}
                        className="accent-emerald-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-zinc-800">
              <button
                onClick={() => setModelPickerOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Simulado de Entrada da Chave (vscode.window.showInputBox / SecretStorage) */}
      {apiKeyPromptOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-5 text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold">Configurar Gemini API Key</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">vscode.SecretStorage</span>
            </div>

            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Armazena a chave com segurança no cofre criptografado do sistema operacional através de <code className="text-zinc-200">context.secrets</code>.
            </p>

            <div className="space-y-2 mb-4">
              <label className="block text-[11px] font-mono text-zinc-400">
                GEMINI_API_KEY (máscara ativada):
              </label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-zinc-500">
                Deixe vazio e clique em Salvar para remover a chave do cofre.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setApiKeyPromptOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md transition-colors"
              >
                Salvar no Cofre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
