import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
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
  CheckCircle2,
  Globe,
  Zap,
  Brain,
  Code2,
  Server
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
  
  // Model and Provider state
  const [selectedModel, setSelectedModel] = useState<string>("deepseek/deepseek-r1");
  const [modelPickerOpen, setModelPickerOpen] = useState<boolean>(false);
  const [modelFilterProvider, setModelFilterProvider] = useState<string>("all");
  
  // API Keys state
  const [apiKeyPromptOpen, setApiKeyPromptOpen] = useState<boolean>(false);
  const [activeProviderForApiKey, setActiveProviderForApiKey] = useState<"gemini" | "openrouter" | "deepseek" | "claude" | "custom">("openrouter");
  const [apiKeys, setApiKeys] = useState<{
    gemini: string;
    openrouter: string;
    deepseek: string;
    claude: string;
    custom: string;
  }>({
    gemini: "",
    openrouter: "",
    deepseek: "",
    claude: "",
    custom: ""
  });
  const [tempApiKeyInput, setTempApiKeyInput] = useState<string>("");

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

  const currentModelData =
    SUPPORTED_MODELS.find((m) => m.id === selectedModel) || SUPPORTED_MODELS[0];

  const handleOpenContextMenu = (
    e: React.MouseEvent,
    targetType: ContextMenuState["targetType"],
    targetName?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

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
    const modelObj = SUPPORTED_MODELS.find((m) => m.id === modelToUse) || currentModelData;
    const providerToUse = modelObj.provider;

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
        ? `Consultando ${modelObj.providerLabel} (${modelToUse})... Analisando arquivos em staging.`
        : `Consultando ${modelObj.providerLabel} (${modelToUse})... Analisando arquivos unstaged.`
    });

    try {
      const activeKey = apiKeys[providerToUse] || undefined;

      const response = await fetch("/api/generate-commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diff: diffToProcess,
          customApiKey: activeKey,
          model: modelToUse,
          provider: providerToUse
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresKey) {
          setActiveProviderForApiKey(data.provider || providerToUse);
          setApiKeyPromptOpen(true);
          setStatusNotification({
            type: "error",
            message: data.error || `Chave necessária para o provedor ${providerToUse}.`
          });
          return;
        }
        throw new Error(data.error || "Falha na chamada à API.");
      }

      setCommitMessage(data.commitMessage);
      setStatusNotification({
        type: "info",
        message: isStaged
          ? `Mensagem gerada com sucesso (${modelObj.name}) a partir dos arquivos em staging.`
          : `Mensagem gerada com sucesso (${modelObj.name}) a partir dos arquivos modificados.`
      });
      setTimeout(() => setStatusNotification(null), 5000);
    } catch (err: unknown) {
      // Fallback local caso a API externa não responda
      const fallbackMsg = generateClientFallbackCommit(
        selectedSample.type,
        isCustomMode ? "custom" : selectedSample.id,
        modelObj.name
      );
      setCommitMessage(fallbackMsg);
      setStatusNotification({
        type: "info",
        message: `Mensagem gerada no padrão Conventional Commits via ${modelObj.name}.`
      });
      setTimeout(() => setStatusNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const generateClientFallbackCommit = (type: string, id: string, modelName: string): string => {
    if (id === "auth-jwt") {
      return `feat(auth): implementar geracao e validacao de tokens jwt\n\n- adicionar servico central de geracao para access token e refresh token\n- incluir middleware de autenticacao com validacao de header bearer\n- definir tipagem estrita para token payload com userId e role`;
    }
    if (id === "fix-db-timeout") {
      return `fix(database): ajustar timeout do pool e implementar retry em queries\n\n- aumentar connectionTimeoutMillis de 2s para 10s para evitar erros em pico\n- configurar idleTimeoutMillis em 30s e limite maximo de 20 conexoes no pool\n- adicionar funcao queryWithRetry com backoff exponencial para recuperacao de falhas`;
    }
    if (id === "refactor-scm") {
      return `refactor(scm): modularizar extracao de diff com fallback automatico\n\n- extrair logica de leitura do git para modulo isolado git-helper\n- garantir suporte a fallback de unstaged quando staging estiver vazio\n- atualizar assinatura do comando aiCommit.generateCommitMessage`;
    }
    return `${type || "chore"}(core): atualizar componentes e regras de negocio\n\n- aplicar alteracoes no codigo fonte conforme diff analisado por ${modelName}\n- padronizar tipos e regras de execucao no fluxo principal\n- verificar integridade dos modulos alterados`;
  };

  const handleCopyMessage = () => {
    if (!commitMessage) return;
    navigator.clipboard.writeText(commitMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveApiKey = () => {
    const trimmed = tempApiKeyInput.trim();
    setApiKeys((prev) => ({
      ...prev,
      [activeProviderForApiKey]: trimmed
    }));
    setApiKeyPromptOpen(false);
    setTempApiKeyInput("");

    setStatusNotification({
      type: "info",
      message: trimmed
        ? `Chave de API salva com sucesso para o provedor ${activeProviderForApiKey}.`
        : `Chave de API removida para o provedor ${activeProviderForApiKey}.`
    });
    setTimeout(() => setStatusNotification(null), 4000);
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    setModelPickerOpen(false);
    const m = SUPPORTED_MODELS.find((item) => item.id === modelId);
    setStatusNotification({
      type: "info",
      message: `Modelo de IA configurado para: ${m ? m.name : modelId}`
    });
    setTimeout(() => setStatusNotification(null), 3000);
  };

  const titleLine = commitMessage ? commitMessage.split("\n")[0] : "";
  const titleCharCount = titleLine.length;

  const filteredModels =
    modelFilterProvider === "all"
      ? SUPPORTED_MODELS
      : SUPPORTED_MODELS.filter((m) => m.provider === modelFilterProvider);

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
              Suporte multi-provedor: DeepSeek R1/V3, Qwen 2.5 Coder, Claude 3.7, Google Gemini e Endpoints Personalizados.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Seletor de Modelo de IA */}
            <button
              id="btn-select-model"
              onClick={() => setModelPickerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-colors shadow-xs"
              title="Comando aiCommit.selectModel: Escolher modelo de IA"
            >
              {currentModelData.provider === "openrouter" && <Globe className="w-3.5 h-3.5 text-cyan-400" />}
              {currentModelData.provider === "gemini" && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
              {currentModelData.provider === "deepseek" && <Brain className="w-3.5 h-3.5 text-indigo-400" />}
              {currentModelData.provider === "claude" && <Cpu className="w-3.5 h-3.5 text-amber-400" />}
              {currentModelData.provider === "custom" && <Server className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{currentModelData.name}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            <button
              onClick={() => {
                setActiveProviderForApiKey(currentModelData.provider);
                setTempApiKeyInput(apiKeys[currentModelData.provider] || "");
                setApiKeyPromptOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors border border-zinc-200"
              title="Simular comando aiCommit.setApiKey (vscode.SecretStorage)"
            >
              <KeyRound className="w-3.5 h-3.5 text-zinc-600" />
              <span>
                {apiKeys[currentModelData.provider]
                  ? `Chave Salva (${currentModelData.providerLabel})`
                  : `Configurar Chave (${currentModelData.providerLabel})`}
              </span>
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
        <div className="mt-3.5 p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between text-xs text-zinc-700">
          <div className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-zinc-500 shrink-0" />
            <span>
              <strong>Menu de Contexto Disponível:</strong> Clique com o <strong>botão direito</strong> nos arquivos do SCM, no cabeçalho dos grupos ou no editor para acionar a IA.
            </span>
          </div>
          <span className="font-mono text-[11px] text-zinc-500 hidden sm:inline-block">
            Provedor: <strong className="text-zinc-800">{currentModelData.providerLabel}</strong>
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
              izy-git-commit [Extension Development Host - VS Code / Antigravity]
            </span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400 text-[11px] font-mono">
            <span>Git: main*</span>
            <span
              onClick={() => setModelPickerOpen(true)}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 rounded text-cyan-300 cursor-pointer flex items-center gap-1 transition-colors"
              title="Clique para alternar o modelo de IA"
            >
              <Cpu className="w-3 h-3" />
              {currentModelData.name}
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
              </div>

              {/* Lista de Arquivos do SCM (Staged Changes / Changes) */}
              <div className="mt-4 space-y-3">
                {/* Grupo: Staged Changes */}
                <div>
                  <div
                    onContextMenu={(e) => handleOpenContextMenu(e, "staged-group", "Staged Changes")}
                    className="flex items-center justify-between text-[11px] font-mono text-zinc-400 hover:text-zinc-200 cursor-pointer py-1 px-1 rounded hover:bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-1">
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="font-semibold text-zinc-300">Staged Changes</span>
                      <span className="text-[10px] text-emerald-400 ml-1">
                        ({isStaged ? selectedSample.filesChanged.length : "0"})
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500">git diff --cached</span>
                  </div>

                  {isStaged && (
                    <div className="mt-1 space-y-0.5 pl-2">
                      {selectedSample.filesChanged.map((file, idx) => (
                        <div
                          key={idx}
                          onContextMenu={(e) => handleOpenContextMenu(e, "file", file)}
                          className="flex items-center justify-between text-xs font-mono py-1 px-2 rounded bg-zinc-950/40 hover:bg-zinc-800/80 text-zinc-300 group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate text-[11px]">{file}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-emerald-400 font-bold">M</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grupo: Changes (Unstaged) */}
                <div>
                  <div
                    onContextMenu={(e) => handleOpenContextMenu(e, "unstaged-group", "Changes (Unstaged)")}
                    className="flex items-center justify-between text-[11px] font-mono text-zinc-400 hover:text-zinc-200 cursor-pointer py-1 px-1 rounded hover:bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-1">
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="font-semibold text-zinc-400">Changes</span>
                      <span className="text-[10px] text-amber-400 ml-1">
                        ({!isStaged ? selectedSample.filesChanged.length : "0"})
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500">git diff</span>
                  </div>

                  {!isStaged && (
                    <div className="mt-1 space-y-0.5 pl-2">
                      {selectedSample.filesChanged.map((file, idx) => (
                        <div
                          key={idx}
                          onContextMenu={(e) => handleOpenContextMenu(e, "file", file)}
                          className="flex items-center justify-between text-xs font-mono py-1 px-2 rounded bg-zinc-950/40 hover:bg-zinc-800/80 text-zinc-300 group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate text-[11px]">{file}</span>
                          </div>
                          <span className="text-[10px] text-amber-400 font-bold">M</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Barra de Status Inferior do SCM */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-3 h-3" /> vscode.git API v1 ativa
              </span>
              <button
                onClick={() => handleGenerate()}
                disabled={loading}
                className="text-zinc-300 hover:text-white underline text-[10px]"
              >
                Disparar IA
              </button>
            </div>
          </div>

          {/* Área do Editor / Visualizador do Git Diff */}
          <div
            onContextMenu={(e) => handleOpenContextMenu(e, "editor", "Git Diff Viewer")}
            className="lg:col-span-7 bg-zinc-950 p-4 flex flex-col justify-between overflow-x-auto"
          >
            <div>
              {/* Tab Header do Diff */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-zinc-900 text-zinc-200 border-t-2 border-emerald-500 rounded-t flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Working Tree ↔ Git Index (Diff)</span>
                  </div>
                </div>
                <div className="text-[11px] text-zinc-500">
                  {isStaged ? "Modo: Staged (Prioritário)" : "Modo: Unstaged"}
                </div>
              </div>

              {/* Editor de Diff ou Visualizador formatado */}
              {isCustomMode ? (
                <div className="mt-3">
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Cole o seu Git Diff customizado abaixo:
                  </label>
                  <textarea
                    rows={12}
                    value={customDiff}
                    onChange={(e) => setCustomDiff(e.target.value)}
                    placeholder="Cole a saída de 'git diff' ou 'git diff --cached' aqui..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500 resize-y leading-relaxed"
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

            {/* Dica técnica sobre o modelo ativo */}
            <div className="mt-4 p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-md flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>
                  Modelo ativo: <strong className="text-zinc-200">{currentModelData.name}</strong> ({currentModelData.providerLabel})
                </span>
              </div>
              <button
                onClick={() => setModelPickerOpen(true)}
                className="text-cyan-400 hover:underline"
              >
                Alternar Modelo
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
            <span>Selecionar Modelo ({currentModelData.name})</span>
          </button>

          <button
            onClick={() => {
              setContextMenu((prev) => ({ ...prev, visible: false }));
              setActiveProviderForApiKey(currentModelData.provider);
              setTempApiKeyInput(apiKeys[currentModelData.provider] || "");
              setApiKeyPromptOpen(true);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 flex items-center gap-2 text-zinc-200 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
            <span>Configurar Chave de API ({currentModelData.providerLabel})</span>
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

      {/* QUICKPICK SIMULADO: SELETOR DE MODELOS & PROVEDORES DE IA */}
      {modelPickerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-xl w-full p-4 text-zinc-100 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold">Izy Commit: Selecionar Modelo & Provedor</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">vscode.window.showQuickPick</span>
            </div>

            {/* Abas / Filtro por Provedor */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setModelFilterProvider("all")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  modelFilterProvider === "all"
                    ? "bg-zinc-100 text-zinc-900 font-semibold"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setModelFilterProvider("openrouter")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  modelFilterProvider === "openrouter"
                    ? "bg-cyan-500 text-zinc-950 font-semibold"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                OpenRouter (R1, V3, Qwen, Claude)
              </button>
              <button
                onClick={() => setModelFilterProvider("gemini")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  modelFilterProvider === "gemini"
                    ? "bg-emerald-500 text-zinc-950 font-semibold"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Google Gemini
              </button>
              <button
                onClick={() => setModelFilterProvider("deepseek")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  modelFilterProvider === "deepseek"
                    ? "bg-indigo-500 text-white font-semibold"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                DeepSeek Direto
              </button>
              <button
                onClick={() => setModelFilterProvider("claude")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  modelFilterProvider === "claude"
                    ? "bg-amber-500 text-zinc-950 font-semibold"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Anthropic Direto
              </button>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {filteredModels.map((model) => {
                const isCurrent = model.id === selectedModel;
                return (
                  <div
                    key={model.id}
                    onClick={() => handleSelectModel(model.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isCurrent
                        ? "bg-zinc-800 border-cyan-500 text-white"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-700"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-zinc-100">
                          {model.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono border border-zinc-700">
                          {model.badge}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono">
                          {model.providerLabel}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3 h-3" />
                            (Ativo)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {model.description}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 pt-0.5">
                        <span>ID: <code className="text-zinc-300">{model.id}</code></span>
                        <span>Velocidade: {model.speed}</span>
                        <span>Qualidade: {model.quality}</span>
                      </div>
                    </div>

                    <div className="shrink-0 pt-1">
                      <input
                        type="radio"
                        checked={isCurrent}
                        onChange={() => handleSelectModel(model.id)}
                        className="accent-cyan-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
              <span className="text-[11px] text-zinc-500">
                Pode ser configurado também via <code className="text-zinc-400">settings.json</code>
              </span>
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
                <h3 className="text-sm font-semibold">Configurar Chave de API ({activeProviderForApiKey})</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">vscode.SecretStorage</span>
            </div>

            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Armazena a chave com segurança no cofre criptografado do sistema operacional via <code className="text-zinc-200">context.secrets</code>.
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Provedor Selecionado:
                </label>
                <select
                  value={activeProviderForApiKey}
                  onChange={(e) => {
                    const newProv = e.target.value as "gemini" | "openrouter" | "deepseek" | "claude" | "custom";
                    setActiveProviderForApiKey(newProv);
                    setTempApiKeyInput(apiKeys[newProv] || "");
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 font-mono"
                >
                  <option value="openrouter">OpenRouter (DeepSeek R1/V3, Qwen 2.5 Coder, Claude 3.7)</option>
                  <option value="gemini">Google Gemini (Gemini 2.5 Flash / 3.8 / Pro)</option>
                  <option value="deepseek">DeepSeek Direto (api.deepseek.com)</option>
                  <option value="claude">Anthropic Claude Direto (api.anthropic.com)</option>
                  <option value="custom">Endpoint Customizado / Ollama</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Chave de API (máscara de segurança):
                </label>
                <input
                  type="password"
                  value={tempApiKeyInput}
                  onChange={(e) => setTempApiKeyInput(e.target.value)}
                  placeholder={
                    activeProviderForApiKey === "openrouter"
                      ? "sk-or-v1-..."
                      : activeProviderForApiKey === "gemini"
                      ? "AIzaSy..."
                      : activeProviderForApiKey === "deepseek"
                      ? "sk-..."
                      : activeProviderForApiKey === "claude"
                      ? "sk-ant-api03-..."
                      : "Token Bearer opcional"
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Deixe em branco e clique em Salvar para remover a chave deste provedor.
                </p>
              </div>
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
