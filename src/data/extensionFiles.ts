export interface ExtensionFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: "gemini" | "openrouter" | "deepseek" | "claude" | "custom";
  providerLabel: string;
  badge: string;
  description: string;
  speed: string;
  quality: string;
  icon?: string;
}

export const SUPPORTED_MODELS: ModelOption[] = [
  // OpenRouter Multi-Model Hub
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    badge: "Raciocínio",
    description: "Raciocínio profundo open-weights (comparável a o1) via OpenRouter.",
    speed: "Média",
    quality: "Excepcional"
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V3 (671B)",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    badge: "Alta Eficiência",
    description: "Excelente para geração rápida e estruturada de commits técnicos.",
    speed: "Muito Alta",
    quality: "Excelente"
  },
  {
    id: "qwen/qwen-2.5-coder-32b-instruct",
    name: "Qwen 2.5 Coder 32B",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    badge: "Código Especialista",
    description: "Modelo da Alibaba especializado em compreensão de código e diffs Git.",
    speed: "Alta",
    quality: "Superior"
  },
  {
    id: "anthropic/claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    badge: "Flagship",
    detail: "Raciocínio híbrido e alta capacidade semântica para Conventional Commits.",
    speed: "Alta",
    quality: "Máxima"
  } as any,
  {
    id: "anthropic/claude-3.5-haiku",
    name: "Claude 3.5 Haiku",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    badge: "Ultrarrápido",
    description: "Máxima velocidade com sintaxe precisa e semântica estrita.",
    speed: "Instantânea",
    quality: "Excelente"
  },

  // Google Gemini
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "gemini",
    providerLabel: "Google Gemini",
    badge: "Padrão",
    description: "Equilibrado, rápido e gratuito com cota no Google AI Studio.",
    speed: "Muito Alta",
    quality: "Excelente"
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    provider: "gemini",
    providerLabel: "Google Gemini",
    badge: "Recente",
    description: "Alta velocidade com raciocínio e precisão contextual avançada.",
    speed: "Alta",
    quality: "Superior"
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    provider: "gemini",
    providerLabel: "Google Gemini",
    badge: "Raciocínio",
    description: "Raciocínio aprofundado para refatorações complexas e grandes diffs.",
    speed: "Média",
    quality: "Máxima"
  },

  // DeepSeek Oficial
  {
    id: "deepseek-chat",
    name: "DeepSeek V3 (Direto)",
    provider: "deepseek",
    providerLabel: "DeepSeek Direto",
    badge: "Oficial",
    description: "Endpoint oficial api.deepseek.com para DeepSeek V3.",
    speed: "Muito Alta",
    quality: "Excelente"
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek R1 (Direto)",
    provider: "deepseek",
    providerLabel: "DeepSeek Direto",
    badge: "Raciocínio",
    description: "Endpoint oficial api.deepseek.com com reasoning chain nativo.",
    speed: "Média",
    quality: "Excepcional"
  },

  // Anthropic Claude Oficial
  {
    id: "claude-3-7-sonnet-20250219",
    name: "Claude 3.7 Sonnet (Direto)",
    provider: "claude",
    providerLabel: "Anthropic Direto",
    badge: "Sonnet 3.7",
    description: "Endpoint oficial api.anthropic.com com raciocínio híbrido.",
    speed: "Alta",
    quality: "Máxima"
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku (Direto)",
    provider: "claude",
    providerLabel: "Anthropic Direto",
    badge: "Haiku 3.5",
    description: "Endpoint oficial api.anthropic.com de ultrabaixa latência.",
    speed: "Instantânea",
    quality: "Excelente"
  }
];

export const EXTENSION_FILES: ExtensionFile[] = [
  {
    name: "package.json",
    path: "package.json",
    language: "json",
    description: "Manifesto da extensão do VS Code com ativação, comandos, ícone $(sparkle) em scm/title, menus de contexto e suporte multi-provedor (Gemini, OpenRouter, DeepSeek, Claude, Qwen).",
    content: `{
  "name": "izy-git-commit",
  "displayName": "Izy Git Commit Generator",
  "description": "Gere mensagens de commit no padrão Conventional Commits via Google Gemini, OpenRouter (DeepSeek R1/V3, Qwen 2.5 Coder, Claude 3.7) e endpoints personalizados.",
  "version": "1.2.0",
  "publisher": "pedromarcio",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": [
    "SCM Providers",
    "Machine Learning",
    "Programming Languages"
  ],
  "keywords": [
    "git",
    "commit",
    "gemini",
    "openrouter",
    "deepseek",
    "claude",
    "qwen",
    "ai",
    "conventional-commits",
    "scm"
  ],
  "activationEvents": [
    "onStartupFinished"
  ],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "aiCommit.generateCommitMessage",
        "title": "Gerar Mensagem de Commit com IA",
        "icon": "$(sparkle)"
      },
      {
        "command": "aiCommit.selectModel",
        "title": "Izy Commit: Selecionar Modelo & Provedor de IA",
        "icon": "$(server-process)"
      },
      {
        "command": "aiCommit.setApiKey",
        "title": "Izy Commit: Configurar Chaves de API",
        "icon": "$(key)"
      }
    ],
    "menus": {
      "scm/title": [
        {
          "command": "aiCommit.generateCommitMessage",
          "group": "navigation@1"
        },
        {
          "command": "aiCommit.selectModel",
          "group": "navigation@2"
        }
      ],
      "scm/resourceGroup/context": [
        {
          "command": "aiCommit.generateCommitMessage",
          "group": "inline"
        },
        {
          "command": "aiCommit.selectModel",
          "group": "1_modification"
        }
      ],
      "scm/resourceState/context": [
        {
          "command": "aiCommit.generateCommitMessage",
          "group": "7_modification"
        }
      ],
      "editor/context": [
        {
          "command": "aiCommit.generateCommitMessage",
          "group": "7_modification",
          "when": "editorTextFocus"
        }
      ],
      "commandPalette": [
        {
          "command": "aiCommit.generateCommitMessage"
        },
        {
          "command": "aiCommit.selectModel"
        },
        {
          "command": "aiCommit.setApiKey"
        }
      ]
    },
    "configuration": {
      "title": "Izy Git Commit",
      "properties": {
        "aiCommit.provider": {
          "type": "string",
          "default": "gemini",
          "enum": [
            "gemini",
            "openrouter",
            "deepseek",
            "claude",
            "custom"
          ],
          "enumDescriptions": [
            "Google Gemini (API Oficial Google AI Studio)",
            "OpenRouter (Hub universal para DeepSeek R1, DeepSeek V3, Qwen 2.5 Coder, Claude 3.7)",
            "DeepSeek (API Direta Oficial - api.deepseek.com)",
            "Anthropic Claude (API Direta Oficial - api.anthropic.com)",
            "Endpoint Customizado / Ollama / OpenAI Compatível"
          ],
          "description": "Provedor de inteligência artificial ativo."
        },
        "aiCommit.model": {
          "type": "string",
          "default": "gemini-2.5-flash",
          "description": "Modelo de IA selecionado para análise do diff e geração de commits."
        },
        "aiCommit.customEndpoint": {
          "type": "string",
          "default": "http://localhost:11434/v1/chat/completions",
          "description": "URL do endpoint customizado compatível com a API da OpenAI (ex: Ollama, vLLM, Groq, Qwen DashScope)."
        },
        "aiCommit.maxDiffLength": {
          "type": "number",
          "default": 30000,
          "description": "Tamanho máximo de caracteres do diff enviado à API para controle de contexto."
        }
      }
    }
  },
  "scripts": {
    "package": "esbuild ./src/extension.ts --bundle --outfile=dist/extension.js --external:vscode --format=cjs --platform=node --minify",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./"
  },
  "dependencies": {
    "@google/genai": "^2.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/vscode": "^1.85.0",
    "esbuild": "^0.28.0",
    "typescript": "^5.3.3"
  }
}`
  },
  {
    name: "tsconfig.json",
    path: "tsconfig.json",
    language: "json",
    description: "Configuração TypeScript recomendada para compilação e tipagem estrita no ambiente do VS Code.",
    content: `{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2022",
    "outDir": "out",
    "lib": [
      "ES2022"
    ],
    "sourceMap": true,
    "rootDir": "src",
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  },
  "include": [
    "src"
  ],
  "exclude": [
    "node_modules",
    ".vscode-test"
  ]
}`
  },
  {
    name: "src/extension.ts",
    path: "src/extension.ts",
    language: "typescript",
    description: "Implementação principal com suporte a múltiplos provedores (Google Gemini, OpenRouter, DeepSeek, Claude, Qwen), SecretStorage isolado e integração nativa com vscode.git.",
    content: `import * as vscode from 'vscode';
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
  // OpenRouter Multi-Model Hub
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

  // Google Gemini
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

  // DeepSeek Oficial
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

  // Anthropic Claude Oficial
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

export function activate(context: vscode.ExtensionContext): void {
  const generateCommand = vscode.commands.registerCommand(
    'aiCommit.generateCommitMessage',
    async (uriOrSourceControl?: unknown) => {
      await handleGenerateCommitMessage(context, uriOrSourceControl);
    }
  );

  const selectModelCommand = vscode.commands.registerCommand(
    'aiCommit.selectModel',
    async () => {
      await promptAndSelectModel();
    }
  );

  const setApiKeyCommand = vscode.commands.registerCommand(
    'aiCommit.setApiKey',
    async () => {
      await promptAndSelectProviderForApiKey(context);
    }
  );

  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = 'aiCommit.selectModel';
  statusBarItem.tooltip = 'Clique para alternar o modelo de IA (Gemini, OpenRouter, DeepSeek, Claude, Qwen)';
  updateStatusBar();
  statusBarItem.show();

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

function getActiveAIConfig(): { provider: AIProvider; model: string } {
  const config = vscode.workspace.getConfiguration('aiCommit');
  const legacyConfig = vscode.workspace.getConfiguration('geminiCommit');

  let model = config.get<string>('model') || legacyConfig.get<string>('model') || DEFAULT_MODEL;
  let provider = config.get<AIProvider>('provider');

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

function updateStatusBar(): void {
  const { model, provider } = getActiveAIConfig();
  const preset = PRESET_MODELS.find((m) => m.id === model);
  const displayName = preset ? preset.name.split(' (')[0] : model;

  let icon = '$(sparkle)';
  if (provider === 'openrouter') icon = '$(globe)';
  if (provider === 'deepseek') icon = '$(brain)';
  if (provider === 'claude') icon = '$(hubot)';
  if (provider === 'custom') icon = '$(server)';

  statusBarItem.text = \`\${icon} \${displayName}\`;
}

async function promptAndSelectModel(): Promise<{ provider: AIProvider; model: string } | undefined> {
  const { model: currentModel } = getActiveAIConfig();

  interface QuickModelItem extends vscode.QuickPickItem {
    modelId?: string;
    provider?: AIProvider;
    isCustomAction?: boolean;
  }

  const items: QuickModelItem[] = [];

  items.push({
    label: 'OpenRouter (DeepSeek R1, DeepSeek V3, Qwen 2.5, Claude 3.7)',
    kind: vscode.QuickPickItemKind.Separator
  });
  PRESET_MODELS.filter((m) => m.provider === 'openrouter').forEach((m) => {
    items.push({
      label: \`\${m.icon} \${m.name}\`,
      modelId: m.id,
      provider: m.provider,
      description: currentModel === m.id ? '(Ativo)' : \`[\${m.badge}]\`,
      detail: m.detail
    });
  });

  items.push({
    label: 'Google Gemini (API Oficial Google AI Studio)',
    kind: vscode.QuickPickItemKind.Separator
  });
  PRESET_MODELS.filter((m) => m.provider === 'gemini').forEach((m) => {
    items.push({
      label: \`\${m.icon} \${m.name}\`,
      modelId: m.id,
      provider: m.provider,
      description: currentModel === m.id ? '(Ativo)' : \`[\${m.badge}]\`,
      detail: m.detail
    });
  });

  items.push({
    label: 'DeepSeek (API Direta Oficial - api.deepseek.com)',
    kind: vscode.QuickPickItemKind.Separator
  });
  PRESET_MODELS.filter((m) => m.provider === 'deepseek').forEach((m) => {
    items.push({
      label: \`\${m.icon} \${m.name}\`,
      modelId: m.id,
      provider: m.provider,
      description: currentModel === m.id ? '(Ativo)' : \`[\${m.badge}]\`,
      detail: m.detail
    });
  });

  items.push({
    label: 'Anthropic Claude (API Direta Oficial - api.anthropic.com)',
    kind: vscode.QuickPickItemKind.Separator
  });
  PRESET_MODELS.filter((m) => m.provider === 'claude').forEach((m) => {
    items.push({
      label: \`\${m.icon} \${m.name}\`,
      modelId: m.id,
      provider: m.provider,
      description: currentModel === m.id ? '(Ativo)' : \`[\${m.badge}]\`,
      detail: m.detail
    });
  });

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
        vscode.window.showInformationMessage(\`Modelo OpenRouter configurado: \${finalId}\`);
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
        vscode.window.showInformationMessage(\`Endpoint personalizado configurado: \${customModel.trim()}\`);
        return { provider: 'custom', model: customModel.trim() };
      }
    }
    return undefined;
  }

  if (selected.modelId && selected.provider) {
    await config.update('provider', selected.provider, vscode.ConfigurationTarget.Global);
    await config.update('model', selected.modelId, vscode.ConfigurationTarget.Global);
    updateStatusBar();
    vscode.window.showInformationMessage(\`Modelo alterado para: \${selected.modelId} (\${selected.provider})\`);
    return { provider: selected.provider, model: selected.modelId };
  }

  return undefined;
}

async function handleGenerateCommitMessage(
  context: vscode.ExtensionContext,
  uriOrSourceControl?: unknown
): Promise<void> {
  try {
    const gitApi = await getGitApi();
    if (!gitApi) {
      vscode.window.showErrorMessage('Extensão Git integrada do VS Code não encontrada ou desativada.');
      return;
    }

    const repository = getTargetRepository(gitApi, uriOrSourceControl);
    if (!repository) {
      vscode.window.showErrorMessage('Nenhum repositório Git aberto ou selecionado no workspace atual.');
      return;
    }

    const { diff, isStaged } = await extractGitDiff(repository);
    if (!diff || diff.trim().length === 0) {
      vscode.window.showWarningMessage('Nenhuma alteração Git detectada (staged ou unstaged) para gerar o commit.');
      return;
    }

    const { provider, model } = getActiveAIConfig();
    const apiKey = await getOrPromptApiKeyForProvider(context, provider);
    if (!apiKey && provider !== 'custom') {
      return;
    }

    const commitMessage = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: isStaged
          ? \`IA (\${model}): Analisando arquivos em staging...\`
          : \`IA (\${model}): Analisando alterações não preparadas...\`,
        cancellable: false
      },
      async (progress) => {
        progress.report({ message: \`Consultando \${provider} (\${model})...\` });
        return await dispatchCommitRequest(provider, model, apiKey || '', diff);
      }
    );

    if (!commitMessage || commitMessage.trim().length === 0) {
      vscode.window.showErrorMessage('A API não retornou mensagem de commit válida.');
      return;
    }

    repository.inputBox.value = commitMessage.trim();
    vscode.window.showInformationMessage(
      isStaged
        ? \`Mensagem gerada com sucesso (\${model}) a partir dos arquivos em staging.\`
        : \`Mensagem gerada com sucesso (\${model}) a partir dos arquivos modificados.\`
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(\`Erro ao gerar commit: \${errorMsg}\`);
  }
}

async function dispatchCommitRequest(
  provider: AIProvider,
  model: string,
  apiKey: string,
  gitDiff: string
): Promise<string> {
  const config = vscode.workspace.getConfiguration('aiCommit');
  const maxDiffLength = config.get<number>('maxDiffLength') || 30000;

  const preparedDiff = gitDiff.length > maxDiffLength
    ? \`\${gitDiff.slice(0, maxDiffLength)}\\n\\n[Diff truncado em \${maxDiffLength} caracteres]\`
    : gitDiff;

  const systemInstruction = \`Você é um Engenheiro de Software Sênior especialista em Git e Conventional Commits.
Sua tarefa é analisar o git diff fornecido e retornar exclusivamente a mensagem de commit pronta para uso.

Regras estritas de formatação:
- Linha 1: Título no formato Conventional Commits: tipo(escopo opcional): descrição curta no imperativo (máx 72 caracteres).
  Tipos permitidos: feat, fix, refactor, perf, test, docs, style, build, ci, chore, revert.
- Linha 2: Obrigatoriamente uma linha em branco.
- Linhas seguintes: Tópicos detalhando as alterações técnicas, usando exclusivamente hífens (-) como marcadores.
- Não inclua blocos de código markdown (\`\`\`), preâmbulos, saudações ou justificativas fora da mensagem.
- Use apenas hifens (-) para listas e pontuações, nunca travessões. Mantenha um tom direto e profissional.\`;

  const userPrompt = \`Analise este git diff e gere a mensagem de commit correspondente:\\n\\n\${preparedDiff}\`;

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
      throw new Error(\`Provedor desconhecido: \${provider}\`);
  }
}

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
    ...(apiKey ? { Authorization: \`Bearer \${apiKey}\` } : {}),
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
    throw new Error(\`HTTP \${response.status}: \${errorText}\`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const rawContent = data.choices?.[0]?.message?.content || '';
  return cleanCommitMessage(rawContent);
}

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
    throw new Error(\`Anthropic HTTP \${response.status}: \${errorText}\`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const textBlock = data.content?.find((c) => c.type === 'text');
  const rawContent = textBlock?.text || '';
  return cleanCommitMessage(rawContent);
}

function getSecretKeyNameForProvider(provider: AIProvider): string {
  switch (provider) {
    case 'gemini': return 'GEMINI_API_KEY';
    case 'openrouter': return 'OPENROUTER_API_KEY';
    case 'deepseek': return 'DEEPSEEK_API_KEY';
    case 'claude': return 'ANTHROPIC_API_KEY';
    case 'custom': return 'CUSTOM_API_KEY';
  }
}

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

async function promptAndSaveApiKeyForProvider(
  context: vscode.ExtensionContext,
  provider: AIProvider
): Promise<string | undefined> {
  const secretKeyName = getSecretKeyNameForProvider(provider);
  const currentKey = await context.secrets.get(secretKeyName);

  let providerName = 'Google Gemini';
  let example = 'AIzaSy...';

  if (provider === 'openrouter') {
    providerName = 'OpenRouter';
    example = 'sk-or-v1-...';
  } else if (provider === 'deepseek') {
    providerName = 'DeepSeek';
    example = 'sk-...';
  } else if (provider === 'claude') {
    providerName = 'Anthropic Claude';
    example = 'sk-ant-api03-...';
  } else if (provider === 'custom') {
    providerName = 'Endpoint Personalizado';
    example = 'Bearer token ou deixe em branco se local';
  }

  const input = await vscode.window.showInputBox({
    title: \`Configurar Chave de API: \${providerName}\`,
    prompt: \`Cole sua chave de API para \${providerName}\`,
    password: true,
    ignoreFocusOut: true,
    placeHolder: currentKey ? 'Deixe em branco para remover ou digite a nova chave' : \`Ex: \${example}\`
  });

  if (input === undefined) {
    return undefined;
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    await context.secrets.delete(secretKeyName);
    vscode.window.showInformationMessage(\`Chave de \${providerName} removida do cofre seguro.\`);
    return undefined;
  }

  await context.secrets.store(secretKeyName, trimmed);
  vscode.window.showInformationMessage(\`Chave de \${providerName} salva com sucesso.\`);
  return trimmed;
}

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

function cleanCommitMessage(text: string): string {
  let cleaned = text.trim();
  const mdFence = String.fromCharCode(96, 96, 96);

  if (cleaned.startsWith(mdFence)) {
    cleaned = cleaned.replace(new RegExp('^' + mdFence + '(?:gitcommit|text|markdown)?\\s*', 'i'), '');
    cleaned = cleaned.replace(new RegExp('\\s*' + mdFence + '$'), '');
  }

  return cleaned.trim();
}`
  },
  {
    name: "src/git.d.ts",
    path: "src/git.d.ts",
    language: "typescript",
    description: "Definição de tipos TypeScript estritos da API interna vscode.git versão 1.",
    content: `import { Uri, Event } from 'vscode';

export interface GitExtension {
  readonly enabled: boolean;
  readonly autoRepositoryDetection: boolean | 'subFolders' | 'openEditors';
  getAPI(version: 1): API;
}

export interface API {
  readonly git: Git;
  readonly repositories: ReadonlyArray<Repository>;
  readonly onDidOpenRepository: Event<Repository>;
  readonly onDidCloseRepository: Event<Repository>;
}

export interface Git {
  readonly path: string;
}

export interface RepositoryState {
  readonly HEAD: Branch | undefined;
  readonly remotes: ReadonlyArray<Remote>;
  readonly submodules: ReadonlyArray<Submodule>;
  readonly rebaseCommit: Commit | undefined;
  readonly mergeChanges: ReadonlyArray<Change>;
  readonly indexChanges: ReadonlyArray<Change>;
  readonly workingTreeChanges: ReadonlyArray<Change>;
  readonly onDidChange: Event<void>;
}

export interface RepositoryUIState {
  readonly selected: boolean;
  readonly onDidChange: Event<void>;
}

export interface InputBox {
  value: string;
  placeholder?: string;
  readonly onDidChange: Event<string>;
}

export interface Repository {
  readonly rootUri: Uri;
  readonly inputBox: InputBox;
  readonly state: RepositoryState;
  readonly ui: RepositoryUIState;
  diff(cached?: boolean): Promise<string>;
  diffWithHEAD(): Promise<string>;
  diffWith(ref: string): Promise<string>;
  diffIndexWithHEAD(): Promise<string>;
  diffIndexWith(ref: string): Promise<string>;
}

export interface Change {
  readonly uri: Uri;
  readonly originalUri: Uri;
  readonly renameUri: Uri | undefined;
  readonly status: number;
}

export interface Branch {
  readonly name?: string;
  readonly commit?: string;
  readonly type: number;
}

export interface Remote {
  readonly name: string;
  readonly fetchUrl?: string;
  readonly pushUrl?: string;
  readonly isReadOnly: boolean;
}

export interface Submodule {
  readonly name: string;
  readonly path: string;
  readonly url: string;
}

export interface Commit {
  readonly hash: string;
  readonly message: string;
  readonly parents: ReadonlyArray<string>;
  readonly authorDate?: Date;
  readonly commitDate?: Date;
}`
  },
  {
    name: ".vscode/launch.json",
    path: ".vscode/launch.json",
    language: "json",
    description: "Configuração para depuração instantânea no VS Code via tecla F5 (Extension Host).",
    content: `{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Executar Extensão (F5)",
      "type": "extensionHost",
      "request": "launch",
      "runtimeExecutable": "\${execPath}",
      "args": [
        "--extensionDevelopmentPath=\${workspaceFolder}"
      ],
      "outFiles": [
        "\${workspaceFolder}/dist/**/*.js"
      ],
      "preLaunchTask": "npm: package"
    }
  ]
}`
  },
  {
    name: ".vscode/tasks.json",
    path: ".vscode/tasks.json",
    language: "json",
    description: "Tarefas de compilação automáticas pré-execução via esbuild.",
    content: `{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "package",
      "problemMatcher": "$esbuild",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "label": "npm: package"
    },
    {
      "type": "npm",
      "script": "watch",
      "problemMatcher": "$tsc-watch",
      "isBackground": true,
      "label": "npm: watch"
    }
  ]
}`
  },
  {
    name: "README.md",
    path: "README.md",
    language: "markdown",
    description: "Documentação completa com suporte multi-modelo, atalhos, configurações e empacotamento .vsix.",
    content: `# Izy Git Commit Generator (VS Code Extension)

Extensão profissional para Visual Studio Code e Google Antigravity que analisa alterações locais no Git (diffs staged ou unstaged) e gera mensagens semânticas no padrão **Conventional Commits** utilizando modelos de inteligência artificial de ponta:

- **OpenRouter**: DeepSeek R1, DeepSeek V3, Qwen 2.5 Coder 32B, Claude 3.7 Sonnet, Claude 3.5 Haiku, Llama 3.3.
- **Google Gemini**: Gemini 2.5 Flash, Gemini 3.8 Flash, Gemini 3.1 Pro Preview.
- **DeepSeek Oficial**: DeepSeek V3 e DeepSeek R1 Reasoning (api.deepseek.com).
- **Anthropic Claude Oficial**: Claude 3.7 Sonnet, Claude 3.5 Haiku (api.anthropic.com).
- **Endpoint Custom / OpenAI Compatível**: Ollama local (\`http://localhost:11434/v1\`), vLLM, Groq ou Alibaba DashScope (Qwen).

---

## Recursos Principais

- **Integração SCM Nativa**: Botão com ícone \`$(sparkle)\` na barra de título do Source Control e nos menus de contexto de arquivos e grupos.
- **Seletor de Modelos em Tempo Real**: Alterne entre DeepSeek, Qwen, Claude, Gemini e modelos customizados com um clique na barra de status.
- **Cofre Seguro de Credenciais**: Chaves de API salvas via \`vscode.SecretStorage\`.
- **Preenchimento Automático**: A mensagem gerada preenche imediatamente a caixa de texto de commit do Git.

---

## Como Instalar e Rodar

1. **Instalar dependências e compilar**:
\`\`\`bash
npm install
npm run package
\`\`\`

2. **Empacotar como .vsix para o VS Code / Antigravity**:
\`\`\`bash
npx @vscode/vsce package
\`\`\`

3. **Depurar com F5**:
Abra a pasta no editor e pressione **F5** para iniciar o *Extension Development Host*.`
  }
];

export interface SampleDiff {
  id: string;
  title: string;
  type: string;
  filesChanged: string[];
  diff: string;
}

export const SAMPLE_DIFFS: SampleDiff[] = [
  {
    id: "auth-jwt",
    title: "Autenticação JWT e Refresh Token",
    type: "feat",
    filesChanged: ["src/auth/jwt.service.ts", "src/auth/auth.middleware.ts", "src/config/jwt.ts"],
    diff: `diff --git a/src/auth/jwt.service.ts b/src/auth/jwt.service.ts
new file mode 100644
index 0000000..8a91b2c
--- /dev/null
+++ b/src/auth/jwt.service.ts
@@ -0,0 +1,28 @@
+import jwt from 'jsonwebtoken';
+import { JWT_SECRET, REFRESH_SECRET } from '../config/jwt';
+
+export interface TokenPayload {
+  userId: string;
+  role: string;
+}
+
+export function generateTokens(payload: TokenPayload) {
+  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
+  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
+  return { accessToken, refreshToken };
+}
+
+export function verifyAccessToken(token: string): TokenPayload {
+  return jwt.verify(token, JWT_SECRET) as TokenPayload;
+}
diff --git a/src/auth/auth.middleware.ts b/src/auth/auth.middleware.ts
index 10a8b92..3f8e71b 100644
--- a/src/auth/auth.middleware.ts
+++ b/src/auth/auth.middleware.ts
@@ -5,4 +5,14 @@ export function authenticateToken(req: Request, res: Response, next: NextFunction) {
   if (!authHeader) return res.status(401).json({ error: 'Token missing' });
   const token = authHeader.split(' ')[1];
-  // TODO: verify token
+  try {
+    const payload = verifyAccessToken(token);
+    req.user = payload;
+    next();
+  } catch (err) {
+    return res.status(403).json({ error: 'Invalid or expired token' });
+  }`
  },
  {
    id: "fix-db-timeout",
    title: "Correção de Timeout em Pool de Conexões",
    type: "fix",
    filesChanged: ["src/database/pool.ts", "src/database/client.ts"],
    diff: `diff --git a/src/database/pool.ts b/src/database/pool.ts
index 99a12bc..d4e21a0 100644
--- a/src/database/pool.ts
+++ b/src/database/pool.ts
@@ -12,3 +12,5 @@ export const pool = new Pool({
-  connectionTimeoutMillis: 2000,
+  connectionTimeoutMillis: 10000,
+  idleTimeoutMillis: 30000,
+  max: 20,
 });
diff --git a/src/database/client.ts b/src/database/client.ts
index 4b12c8a..8e31a9f 100644
--- a/src/database/client.ts
+++ b/src/database/client.ts
@@ -45,3 +45,7 @@ export async function queryWithRetry<T>(sql: string, params: unknown[] = [], retries = 3): Promise<T> {
+  for (let attempt = 1; attempt <= retries; attempt++) {
+    try {
       return await pool.query(sql, params);
+    } catch (err) {
+      if (attempt === retries) throw err;
+      await new Promise(r => setTimeout(r, attempt * 500));
+    }
+  }`
  },
  {
    id: "refactor-scm",
    title: "Refatoração do Tratamento do SCM Git",
    type: "refactor",
    filesChanged: ["src/extension.ts", "src/git-helper.ts"],
    diff: `diff --git a/src/extension.ts b/src/extension.ts
index a12bc09..f3d4e81 100644
--- a/src/extension.ts
+++ b/src/extension.ts
@@ -20,6 +20,4 @@ export function activate(context: vscode.ExtensionContext) {
-  const disposable = vscode.commands.registerCommand('aiCommit.generate', async () => {
-    const repo = vscode.git.repositories[0];
-    const diff = await repo.diff(true);
-  });
+  const disposable = vscode.commands.registerCommand('aiCommit.generateCommitMessage', async (scm) => {
+    await handleGenerateCommitMessage(context, scm);
+  });
diff --git a/src/git-helper.ts b/src/git-helper.ts
new file mode 100644
index 0000000..7c12f0a
--- /dev/null
+++ b/src/git-helper.ts
@@ -0,0 +1,18 @@
+import * as vscode from 'vscode';
+import { GitExtension, API, Repository } from './git';
+
+export async function extractDiffWithFallback(repo: Repository): Promise<{ diff: string; isStaged: boolean }> {
+  const staged = await repo.diff(true);
+  if (staged && staged.trim().length > 0) {
+    return { diff: staged, isStaged: true };
+  }
+  const unstaged = await repo.diff(false);
+  return { diff: unstaged || '', isStaged: false };
+}`
  }
 ];
