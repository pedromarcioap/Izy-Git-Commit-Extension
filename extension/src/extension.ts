import * as vscode from 'vscode';
import { GoogleGenAI } from '@google/genai';
import { GitExtension, API as GitAPI, Repository } from './git';

export type AIProvider = 'gemini' | 'openrouter' | 'deepseek' | 'claude' | 'custom';

export interface ModelDefinition {
  id: string;
  name: string;
  provider: AIProvider;
  providerLabel: string;
  badge: string;
  detail: string;
  icon: string;
}

export const PRESET_MODELS: ModelDefinition[] = [
  // OpenRouter Multi-Model Hub (DeepSeek, Qwen, Claude, Llama com 1 chave)
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1 (OpenRouter)',
    provider: 'openrouter',
    providerLabel: 'OpenRouter',
    badge: 'Raciocínio',
    detail: 'Raciocínio profundo open-weights com desempenho equivalente a o1/o3-mini.',
    icon: '$(brain)'
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3 (OpenRouter)',
    provider: 'openrouter',
    providerLabel: 'OpenRouter',
    badge: '671B MoE',
    detail: 'Alta precisão técnica, velocidade e custo extremamente baixo.',
    icon: '$(zap)'
  },
  {
    id: 'qwen/qwen-2.5-coder-32b-instruct',
    name: 'Qwen 2.5 Coder 32B (OpenRouter)',
    provider: 'openrouter',
    providerLabel: 'OpenRouter',
    badge: 'Especialista Código',
    detail: 'Modelo da Alibaba otimizado especificamente para análise de código e diffs.',
    icon: '$(code)'
  },
  {
    id: 'anthropic/claude-3.7-sonnet',
    name: 'Claude 3.7 Sonnet (OpenRouter)',
    provider: 'openrouter',
    providerLabel: 'OpenRouter',
    badge: 'Flagship',
    detail: 'Capacidade cognitiva e raciocínio híbrido de última geração.',
    icon: '$(sparkle)'
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku (OpenRouter)',
    provider: 'openrouter',
    providerLabel: 'OpenRouter',
    badge: 'Ultrarrápido',
    detail: 'Latência mínima e excelente aderência a padrões semânticos.',
    icon: '$(rocket)'
  },

  // Google Gemini (API Oficial Google AI Studio)
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (Google)',
    provider: 'gemini',
    providerLabel: 'Google Gemini',
    badge: 'Padrão Gratuito',
    detail: 'Equilibrado, rápido e gratuito no Google AI Studio (Padrão recomendado).',
    icon: '$(sparkle)'
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (Google)',
    provider: 'gemini',
    providerLabel: 'Google Gemini',
    badge: 'Nova Geração',
    detail: 'Velocidade e compreensão multimodal avançada do Google.',
    icon: '$(zap)'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro (Google)',
    provider: 'gemini',
    providerLabel: 'Google Gemini',
    badge: 'Raciocínio',
    detail: 'Maior capacidade de raciocínio para refatorações e diffs extensos.',
    icon: '$(hubot)'
  },

  // DeepSeek (API Direta Oficial)
  {
    id: 'deepseek-chat',
    name: 'DeepSeek V3 (API Direta)',
    provider: 'deepseek',
    providerLabel: 'DeepSeek Oficial',
    badge: 'Direto',
    detail: 'Endpoint oficial api.deepseek.com para o modelo DeepSeek-V3.',
    icon: '$(server)'
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek R1 (API Direta)',
    provider: 'deepseek',
    providerLabel: 'DeepSeek Oficial',
    badge: 'Raciocínio Direto',
    detail: 'Endpoint oficial api.deepseek.com com reasoning chain nativo.',
    icon: '$(brain)'
  },

  // Anthropic Claude (API Direta Oficial)
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet (Anthropic Direto)',
    provider: 'claude',
    providerLabel: 'Anthropic Oficial',
    badge: 'Sonnet 3.7',
    detail: 'Endpoint oficial api.anthropic.com com raciocínio de alta precisão.',
    icon: '$(sparkle)'
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku (Anthropic Direto)',
    provider: 'claude',
    providerLabel: 'Anthropic Oficial',
    badge: 'Haiku 3.5',
    detail: 'Endpoint oficial api.anthropic.com com velocidade e economia.',
    icon: '$(rocket)'
  }
];

const DEFAULT_MODEL = 'gemini-2.5-flash';
const DEFAULT_PROVIDER: AIProvider = 'gemini';

let statusBarItem: vscode.StatusBarItem;

/**
 * Ativa a extensão do VS Code
 */
export function activate(context: vscode.ExtensionContext): void {
  // 1. Comando principal de geração de commit
  const generateCommand = vscode.commands.registerCommand(
    'aiCommit.generateCommitMessage',
    async (uriOrSourceControl?: unknown) => {
      await handleGenerateCommitMessage(context, uriOrSourceControl);
    }
  );

  // 2. Comando para selecionar o modelo de IA (Gemini, OpenRouter, DeepSeek, Claude, Qwen)
  const selectModelCommand = vscode.commands.registerCommand(
    'aiCommit.selectModel',
    async () => {
      await promptAndSelectModel();
    }
  );

  // 3. Comando para configurar chave de API do provedor ativo ou escolher o provedor
  const setApiKeyCommand = vscode.commands.registerCommand(
    'aiCommit.setApiKey',
    async () => {
      await promptAndSelectProviderForApiKey(context);
    }
  );

  // 4. Criação do item na Barra de Status (Status Bar)
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = 'aiCommit.selectModel';
  statusBarItem.tooltip = 'Clique para alternar o modelo de IA (Gemini, OpenRouter, DeepSeek, Claude, Qwen)';
  updateStatusBar();
  statusBarItem.show();

  // Atualizar a status bar quando o usuário alterar as configurações
  const configWatcher = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('aiCommit.model') || e.affectsConfiguration('aiCommit.provider') || e.affectsConfiguration('geminiCommit.model')) {
      updateStatusBar();
    }
  });

  context.subscriptions.push(
    generateCommand,
    selectModelCommand,
    setApiKeyCommand,
    statusBarItem,
    configWatcher
  );
}

export function deactivate(): void {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}

/**
 * Retorna as configurações ativas de IA
 */
function getActiveAIConfig(): { provider: AIProvider; model: string } {
  const config = vscode.workspace.getConfiguration('aiCommit');
  const legacyConfig = vscode.workspace.getConfiguration('geminiCommit');

  let model = config.get<string>('model') || legacyConfig.get<string>('model') || DEFAULT_MODEL;
  let provider = config.get<AIProvider>('provider');

  // Auto-inferir provedor a partir do modelo selecionado se não definido
  if (!provider) {
    const preset = PRESET_MODELS.find((m) => m.id === model);
    if (preset) {
      provider = preset.provider;
    } else if (model.includes('/') || model.startsWith('openrouter/')) {
      provider = 'openrouter';
    } else if (model.startsWith('claude-')) {
      provider = 'claude';
    } else if (model.startsWith('deepseek-')) {
      provider = 'deepseek';
    } else if (model.startsWith('gemini-')) {
      provider = 'gemini';
    } else {
      provider = DEFAULT_PROVIDER;
    }
  }

  return { provider, model };
}

/**
 * Atualiza o texto exibido na barra de status com o modelo atual
 */
function updateStatusBar(): void {
  const { model, provider } = getActiveAIConfig();
  const preset = PRESET_MODELS.find((m) => m.id === model);
  const displayName = preset ? preset.name.split(' (')[0] : model;

  let icon = '$(sparkle)';
  if (provider === 'openrouter') icon = '$(globe)';
  if (provider === 'deepseek') icon = '$(brain)';
  if (provider === 'claude') icon = '$(hubot)';
  if (provider === 'custom') icon = '$(server)';

  statusBarItem.text = `${icon} ${displayName}`;
}

/**
 * Exibe QuickPick para seleção de provedor e modelo
 */
async function promptAndSelectModel(): Promise<{ provider: AIProvider; model: string } | undefined> {
  const { model: currentModel } = getActiveAIConfig();

  interface QuickModelItem extends vscode.QuickPickItem {
    modelId?: string;
    provider?: AIProvider;
    isCustomAction?: boolean;
  }

  const items: QuickModelItem[] = [];

  // Seção OpenRouter
  items.push({
    label: 'OpenRouter (DeepSeek R1, DeepSeek V3, Qwen 2.5, Claude 3.7)',
    kind: vscode.QuickPickItemKind.Separator
  });
  PRESET_MODELS.filter((m) => m.provider === 'openrouter').forEach((m) => {
    items.push({
      label: `${m.icon} ${m.name}`,
      modelId: m.id,
      provider: m.provider,
      description: currentModel === m.id ? '(Ativo)' : `[${m.badge}]`,
      detail: m.detail
    });
  });

  // Seção Google Gemini
  items.push({
    label: 'Google Gemini (API Oficial Google AI Studio)',
    kind: vscode.QuickPickItemKind.Separator
  });
  PRESET_MODELS.filter((m) => m.provider === 'gemini').forEach((m) => {
    items.push({
      label: `${m.icon} ${m.name}`,
      modelId: m.id,
      provider: m.provider,
      description: currentModel === m.id ? '(Ativo)' : `[${m.badge}]`,
      detail: m.detail
    });
  });

  // Seção DeepSeek Oficial
  items.push({
    label: 'DeepSeek (API Direta Oficial - api.deepseek.com)',
    kind: vscode.QuickPickItemKind.Separator
  });
  PRESET_MODELS.filter((m) => m.provider === 'deepseek').forEach((m) => {
    items.push({
      label: `${m.icon} ${m.name}`,
      modelId: m.id,
      provider: m.provider,
      description: currentModel === m.id ? '(Ativo)' : `[${m.badge}]`,
      detail: m.detail
    });
  });

  // Seção Anthropic Claude Oficial
  items.push({
    label: 'Anthropic Claude (API Direta Oficial - api.anthropic.com)',
    kind: vscode.QuickPickItemKind.Separator
  });
  PRESET_MODELS.filter((m) => m.provider === 'claude').forEach((m) => {
    items.push({
      label: `${m.icon} ${m.name}`,
      modelId: m.id,
      provider: m.provider,
      description: currentModel === m.id ? '(Ativo)' : `[${m.badge}]`,
      detail: m.detail
    });
  });

  // Seção Custom / Outros
  items.push({
    label: 'Modelos Personalizados & Outros Endpoints',
    kind: vscode.QuickPickItemKind.Separator
  });
  items.push({
    label: '$(edit) Digitar ID de Modelo do OpenRouter...',
    isCustomAction: true,
    provider: 'openrouter',
    detail: 'Ex: meta-llama/llama-3.3-70b-instruct, mistralai/codestral-2501, etc.'
  });
  items.push({
    label: '$(server) Configurar Endpoint OpenAI Compatível / Ollama / Qwen...',
    isCustomAction: true,
    provider: 'custom',
    detail: 'Conecte a instâncias locais do Ollama (localhost:11434), vLLM, Groq ou Qwen DashScope.'
  });

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Selecione o modelo de IA para análise do Git diff',
    title: 'Izy Git Commit: Selecionar Modelo & Provedor'
  });

  if (!selected) {
    return undefined;
  }

  const config = vscode.workspace.getConfiguration('aiCommit');

  if (selected.isCustomAction) {
    if (selected.provider === 'openrouter') {
      const customId = await vscode.window.showInputBox({
        title: 'OpenRouter Model ID',
        prompt: 'Digite o identificador do modelo no OpenRouter',
        placeHolder: 'Ex: qwen/qwen-2.5-coder-32b-instruct ou deepseek/deepseek-r1',
        ignoreFocusOut: true
      });
      if (customId && customId.trim()) {
        const finalId = customId.trim();
        await config.update('provider', 'openrouter', vscode.ConfigurationTarget.Global);
        await config.update('model', finalId, vscode.ConfigurationTarget.Global);
        updateStatusBar();
        vscode.window.showInformationMessage(`Modelo OpenRouter configurado para: ${finalId}`);
        return { provider: 'openrouter', model: finalId };
      }
    } else if (selected.provider === 'custom') {
      const endpoint = await vscode.window.showInputBox({
        title: 'Endpoint Compatível com OpenAI',
        prompt: 'Digite a URL da API (ex: http://localhost:11434/v1/chat/completions)',
        placeHolder: 'http://localhost:11434/v1/chat/completions',
        ignoreFocusOut: true
      });
      const customModel = await vscode.window.showInputBox({
        title: 'Nome do Modelo no Endpoint',
        prompt: 'Digite o nome do modelo (ex: qwen2.5-coder:32b ou deepseek-r1:14b)',
        placeHolder: 'qwen2.5-coder:32b',
        ignoreFocusOut: true
      });
      if (endpoint && customModel) {
        await config.update('provider', 'custom', vscode.ConfigurationTarget.Global);
        await config.update('customEndpoint', endpoint.trim(), vscode.ConfigurationTarget.Global);
        await config.update('model', customModel.trim(), vscode.ConfigurationTarget.Global);
        updateStatusBar();
        vscode.window.showInformationMessage(`Endpoint personalizado configurado: ${customModel.trim()}`);
        return { provider: 'custom', model: customModel.trim() };
      }
    }
    return undefined;
  }

  if (selected.modelId && selected.provider) {
    await config.update('provider', selected.provider, vscode.ConfigurationTarget.Global);
    await config.update('model', selected.modelId, vscode.ConfigurationTarget.Global);
    updateStatusBar();
    vscode.window.showInformationMessage(`Modelo alterado para: ${selected.modelId} (${selected.provider})`);
    return { provider: selected.provider, model: selected.modelId };
  }

  return undefined;
}

/**
 * Fluxo principal de geração de commit com IA
 */
async function handleGenerateCommitMessage(
  context: vscode.ExtensionContext,
  uriOrSourceControl?: unknown
): Promise<void> {
  try {
    // 1. Obter a API Git integrada do VS Code
    const gitApi = await getGitApi();
    if (!gitApi) {
      vscode.window.showErrorMessage('Extensão Git integrada do VS Code não encontrada ou desativada.');
      return;
    }

    // 2. Localizar o repositório correto no workspace
    const repository = getTargetRepository(gitApi, uriOrSourceControl);
    if (!repository) {
      vscode.window.showErrorMessage('Nenhum repositório Git aberto ou selecionado no workspace atual.');
      return;
    }

    // 3. Extrair o diff (prioriza staged; fallback para unstaged)
    const { diff, isStaged } = await extractGitDiff(repository);
    if (!diff || diff.trim().length === 0) {
      vscode.window.showWarningMessage('Nenhuma alteração Git detectada (staged ou unstaged) para gerar o commit.');
      return;
    }

    // 4. Obter modelo e provedor ativos
    const { provider, model } = getActiveAIConfig();

    // 5. Obter a chave de API segura para o provedor correspondente
    const apiKey = await getOrPromptApiKeyForProvider(context, provider);
    if (!apiKey && provider !== 'custom') {
      // Usuário cancelou a inserção da chave
      return;
    }

    // 6. Executar a chamada de IA com indicador de progresso
    const commitMessage = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: isStaged
          ? `IA (${model}): Analisando arquivos em staging...`
          : `IA (${model}): Analisando alterações não preparadas...`,
        cancellable: false
      },
      async (progress) => {
        progress.report({ message: `Consultando provedor ${provider} (${model})...` });
        return await dispatchCommitRequest(provider, model, apiKey || '', diff);
      }
    );

    if (!commitMessage || commitMessage.trim().length === 0) {
      vscode.window.showErrorMessage('A API não retornou mensagem de commit válida.');
      return;
    }

    // 7. Preencher a caixa de texto do Source Control (SCM)
    repository.inputBox.value = commitMessage.trim();
    vscode.window.showInformationMessage(
      isStaged
        ? `Mensagem gerada com sucesso via ${model} a partir dos arquivos em staging.`
        : `Mensagem gerada com sucesso via ${model} a partir dos arquivos modificados.`
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const { provider } = getActiveAIConfig();
    
    // Tratamento amigável e interativo para erro 401 (Unauthorized / Missing Auth Header)
    if (errorMsg.includes('401') || errorMsg.toLowerCase().includes('unauthorized') || errorMsg.includes('Authentication header')) {
      const providerLabels: Record<AIProvider, string> = {
        openrouter: 'OpenRouter',
        deepseek: 'DeepSeek (Oficial)',
        gemini: 'Google Gemini',
        claude: 'Anthropic Claude',
        custom: 'Endpoint Personalizado'
      };
      const pName = providerLabels[provider] || provider;
      
      const choice = await vscode.window.showErrorMessage(
        `Erro de Autenticação (401) ao conectar com ${pName}: A chave de API está ausente ou inválida.`,
        'Configurar Chave Agora',
        'Obter Chave no Site'
      );

      if (choice === 'Configurar Chave Agora') {
        await promptAndSaveApiKeyForProvider(context, provider);
      } else if (choice === 'Obter Chave no Site') {
        const url = getProviderApiKeyUrl(provider);
        if (url) {
          await vscode.env.openExternal(vscode.Uri.parse(url));
        }
      }
      return;
    }

    vscode.window.showErrorMessage(`Erro ao gerar mensagem de commit: ${errorMsg}`);
  }
}

/**
 * Retorna o link oficial para geração de chaves por provedor
 */
function getProviderApiKeyUrl(provider: AIProvider): string | undefined {
  switch (provider) {
    case 'openrouter':
      return 'https://openrouter.ai/keys';
    case 'deepseek':
      return 'https://platform.deepseek.com/api_keys';
    case 'gemini':
      return 'https://aistudio.google.com/app/apikey';
    case 'claude':
      return 'https://console.anthropic.com/settings/keys';
    default:
      return undefined;
  }
}

/**
 * Despacha a solicitação para o provedor de IA correto
 */
async function dispatchCommitRequest(
  provider: AIProvider,
  model: string,
  apiKey: string,
  gitDiff: string
): Promise<string> {
  const config = vscode.workspace.getConfiguration('aiCommit');
  const maxDiffLength = config.get<number>('maxDiffLength') || 30000;

  const preparedDiff = gitDiff.length > maxDiffLength
    ? `${gitDiff.slice(0, maxDiffLength)}\n\n[Diff truncado em ${maxDiffLength} caracteres por limite de contexto]`
    : gitDiff;

  const systemInstruction = `Você é um Engenheiro de Software Sênior especialista em Git e Conventional Commits.
Sua tarefa é analisar o git diff fornecido e retornar exclusivamente a mensagem de commit pronta para uso.

Regras estritas de formatação:
- Linha 1: Título no formato Conventional Commits: tipo(escopo opcional): descrição curta no imperativo (máx 72 caracteres).
  Tipos permitidos: feat, fix, refactor, perf, test, docs, style, build, ci, chore, revert.
- Linha 2: Obrigatoriamente uma linha em branco.
- Linhas seguintes: Tópicos detalhando as alterações técnicas, usando exclusivamente hífens (-) como marcadores.
- Não inclua blocos de código markdown (\`\`\`), preâmbulos, saudações ou justificativas fora da mensagem.
- Use apenas hifens (-) para listas e pontuações, nunca travessões. Mantenha um tom direto e profissional.`;

  const userPrompt = `Analise este git diff e gere a mensagem de commit correspondente:\n\n${preparedDiff}`;

  // Validação prévia de chave para evitar requisições 401 desnecessárias
  if (provider !== 'custom' && (!apiKey || apiKey.trim().length === 0)) {
    throw new Error(`Chave de API não configurada para o provedor ${provider.toUpperCase()}. Configure em 'Izy Commit: Configurar Chaves de API'.`);
  }

  switch (provider) {
    case 'gemini':
      return await requestFromGemini(apiKey, model, systemInstruction, userPrompt);
    case 'openrouter':
      return await requestFromOpenAICompatible(
        'https://openrouter.ai/api/v1/chat/completions',
        apiKey,
        model,
        systemInstruction,
        userPrompt,
        {
          'HTTP-Referer': 'https://github.com/pedromarcio/izy-git-commit',
          'X-Title': 'Izy Git Commit Extension'
        }
      );
    case 'deepseek':
      return await requestFromOpenAICompatible(
        'https://api.deepseek.com/chat/completions',
        apiKey,
        model,
        systemInstruction,
        userPrompt
      );
    case 'claude':
      return await requestFromClaude(apiKey, model, systemInstruction, userPrompt);
    case 'custom': {
      const customUrl = config.get<string>('customEndpoint') || 'http://localhost:11434/v1/chat/completions';
      return await requestFromOpenAICompatible(customUrl, apiKey, model, systemInstruction, userPrompt);
    }
    default:
      throw new Error(`Provedor desconhecido: ${provider}`);
  }
}

/**
 * Chamada à API oficial do Google Gemini
 */
async function requestFromGemini(
  apiKey: string,
  model: string,
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: userPrompt,
    config: {
      systemInstruction,
      temperature: 0.2
    }
  });

  const rawText = response.text || '';
  return cleanCommitMessage(rawText);
}

/**
 * Chamada a qualquer endpoint compatível com OpenAI (OpenRouter, DeepSeek, Ollama, Qwen, etc.)
 */
async function requestFromOpenAICompatible(
  endpointUrl: string,
  apiKey: string,
  model: string,
  systemInstruction: string,
  userPrompt: string,
  extraHeaders?: Record<string, string>
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    ...(extraHeaders || {})
  };

  const body = {
    model,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.2
  };

  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status} (${response.statusText}): ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const rawContent = data.choices?.[0]?.message?.content || '';
  return cleanCommitMessage(rawContent);
}

/**
 * Chamada à API direta da Anthropic Claude
 */
async function requestFromClaude(
  apiKey: string,
  model: string,
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      temperature: 0.2,
      system: systemInstruction,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic HTTP ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const textBlock = data.content?.find((c) => c.type === 'text');
  const rawContent = textBlock?.text || '';
  return cleanCommitMessage(rawContent);
}

/**
 * Retorna a chave do SecretStorage para o provedor
 */
function getSecretKeyNameForProvider(provider: AIProvider): string {
  switch (provider) {
    case 'gemini':
      return 'GEMINI_API_KEY';
    case 'openrouter':
      return 'OPENROUTER_API_KEY';
    case 'deepseek':
      return 'DEEPSEEK_API_KEY';
    case 'claude':
      return 'ANTHROPIC_API_KEY';
    case 'custom':
      return 'CUSTOM_API_KEY';
  }
}

/**
 * Obtém ou solicita a chave de API para o provedor selecionado
 */
async function getOrPromptApiKeyForProvider(
  context: vscode.ExtensionContext,
  provider: AIProvider
): Promise<string | undefined> {
  const secretKeyName = getSecretKeyNameForProvider(provider);
  const storedKey = await context.secrets.get(secretKeyName);
  if (storedKey && storedKey.trim().length > 0) {
    return storedKey.trim();
  }

  return await promptAndSaveApiKeyForProvider(context, provider);
}

/**
 * Menu QuickPick para escolher qual provedor configurar a chave
 */
async function promptAndSelectProviderForApiKey(context: vscode.ExtensionContext): Promise<void> {
  interface ProviderItem extends vscode.QuickPickItem {
    provider: AIProvider;
  }

  const items: ProviderItem[] = [
    {
      label: '$(globe) OpenRouter API Key',
      provider: 'openrouter',
      detail: 'Chave universal para DeepSeek R1, DeepSeek V3, Qwen 2.5 Coder e Claude 3.7.'
    },
    {
      label: '$(sparkle) Google Gemini API Key',
      provider: 'gemini',
      detail: 'Chave do Google AI Studio para Gemini 2.5 Flash / 3.8 / Pro.'
    },
    {
      label: '$(brain) DeepSeek API Key',
      provider: 'deepseek',
      detail: 'Chave direta de api.deepseek.com (DeepSeek V3 / R1 oficial).'
    },
    {
      label: '$(hubot) Anthropic Claude API Key',
      provider: 'claude',
      detail: 'Chave direta de console.anthropic.com (Claude 3.7 / 3.5 Sonnet / Haiku).'
    },
    {
      label: '$(server) Custom Endpoint / Ollama Key',
      provider: 'custom',
      detail: 'Chave opcional para endpoints personalizados compatíveis com OpenAI.'
    }
  ];

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Selecione o provedor para configurar a chave de API',
    title: 'Configurar Chave de API por Provedor'
  });

  if (selected) {
    await promptAndSaveApiKeyForProvider(context, selected.provider);
  }
}

/**
 * Solicita e armazena a chave de API para o provedor no SecretStorage
 */
async function promptAndSaveApiKeyForProvider(
  context: vscode.ExtensionContext,
  provider: AIProvider
): Promise<string | undefined> {
  const secretKeyName = getSecretKeyNameForProvider(provider);
  const currentKey = await context.secrets.get(secretKeyName);

  let providerName = 'Google Gemini';
  let example = 'AIzaSy... (aistudio.google.com)';
  let promptMsg = 'Cole sua chave do Google AI Studio (Gemini)';

  if (provider === 'openrouter') {
    providerName = 'OpenRouter';
    example = 'sk-or-v1-... (openrouter.ai/keys)';
    promptMsg = 'Cole sua chave do OpenRouter (usada para DeepSeek R1/V3, Qwen 2.5 e Claude no OpenRouter)';
  } else if (provider === 'deepseek') {
    providerName = 'DeepSeek Oficial';
    example = 'sk-... (platform.deepseek.com)';
    promptMsg = 'Cole sua chave oficial da DeepSeek (api.deepseek.com)';
  } else if (provider === 'claude') {
    providerName = 'Anthropic Claude';
    example = 'sk-ant-api03-... (console.anthropic.com)';
    promptMsg = 'Cole sua chave oficial da Anthropic';
  } else if (provider === 'custom') {
    providerName = 'Endpoint Personalizado';
    example = 'Bearer token ou deixe em branco para Ollama local';
    promptMsg = 'Cole a chave/token de autenticação (opcional para localhost)';
  }

  const input = await vscode.window.showInputBox({
    title: `Configurar Chave de API: ${providerName}`,
    prompt: promptMsg,
    password: true,
    ignoreFocusOut: true,
    placeHolder: currentKey ? 'Chave já configurada. Deixe em branco para remover ou digite a nova chave' : `Ex: ${example}`
  });

  if (input === undefined) {
    return undefined;
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    await context.secrets.delete(secretKeyName);
    vscode.window.showInformationMessage(`Chave de ${providerName} removida do cofre seguro.`);
    return undefined;
  }

  await context.secrets.store(secretKeyName, trimmed);
  vscode.window.showInformationMessage(`Chave de ${providerName} salva com sucesso.`);
  return trimmed;
}

/**
 * Obtém a extensão nativa vscode.git
 */
async function getGitApi(): Promise<GitAPI | undefined> {
  const extension = vscode.extensions.getExtension<GitExtension>('vscode.git');
  if (!extension) {
    return undefined;
  }
  if (!extension.isActive) {
    await extension.activate();
  }
  return extension.exports.getAPI(1);
}

/**
 * Identifica o repositório ativo no workspace
 */
function getTargetRepository(
  gitApi: GitAPI,
  uriOrSourceControl?: unknown
): Repository | undefined {
  if (gitApi.repositories.length === 0) {
    return undefined;
  }

  if (uriOrSourceControl && typeof uriOrSourceControl === 'object') {
    const candidate = uriOrSourceControl as {
      rootUri?: vscode.Uri;
      resourceUri?: vscode.Uri;
      repository?: Repository;
    };
    if (candidate.repository) {
      return candidate.repository;
    }
    const targetUri = candidate.rootUri || candidate.resourceUri;
    if (targetUri) {
      const match = gitApi.repositories.find((r) =>
        targetUri.fsPath.startsWith(r.rootUri.fsPath)
      );
      if (match) {
        return match;
      }
    }
  }

  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const docUri = activeEditor.document.uri;
    const match = gitApi.repositories.find((r) =>
      docUri.fsPath.startsWith(r.rootUri.fsPath)
    );
    if (match) {
      return match;
    }
  }

  return gitApi.repositories[0];
}

/**
 * Extrai o diff dos arquivos em staging; caso vazio, obtém o diff unstaged
 */
async function extractGitDiff(
  repository: Repository
): Promise<{ diff: string; isStaged: boolean }> {
  let diff = await repository.diff(true);
  if (diff && diff.trim().length > 0) {
    return { diff, isStaged: true };
  }

  diff = await repository.diff(false);
  return { diff: diff || '', isStaged: false };
}

/**
 * Limpa blocos de código markdown e espaços residuais
 */
function cleanCommitMessage(text: string): string {
  let cleaned = text.trim();
  const mdFence = String.fromCharCode(96, 96, 96);

  if (cleaned.startsWith(mdFence)) {
    cleaned = cleaned.replace(new RegExp('^' + mdFence + '(?:gitcommit|text|markdown)?\\s*', 'i'), '');
    cleaned = cleaned.replace(new RegExp('\\s*' + mdFence + '$'), '');
  }

  return cleaned.trim();
}
