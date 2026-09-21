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
  badge: string;
  description: string;
  speed: string;
  quality: string;
}

export const SUPPORTED_MODELS: ModelOption[] = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    badge: "Padrão",
    description: "Equilibrado, rápido e altamente eficiente para análise de commits.",
    speed: "Muito Alta",
    quality: "Excelente"
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    badge: "Recente",
    description: "Alta velocidade com compreensão contextual e precisão semântica aprimorada.",
    speed: "Alta",
    quality: "Superior"
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    badge: "Ultraleve",
    description: "Mínima latência para commits rápidos em alterações pontuais.",
    speed: "Instantânea",
    quality: "Boa"
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    badge: "Raciocínio",
    description: "Raciocínio aprofundado para refatorações complexas e grandes diffs.",
    speed: "Média",
    quality: "Máxima"
  }
];

export const EXTENSION_FILES: ExtensionFile[] = [
  {
    name: "package.json",
    path: "package.json",
    language: "json",
    description: "Manifesto da extensão do VS Code com ativação, comandos, ícone $(sparkle) em scm/title, menus de contexto (botão direito) e seleção de modelos.",
    content: `{
  "name": "gemini-git-commit",
  "displayName": "Gemini Git Commit Generator",
  "description": "Gere mensagens de commit no padrão Conventional Commits via Google Gemini 2.5 Flash com integração nativa ao SCM e menus de contexto.",
  "version": "1.1.0",
  "publisher": "seu-usuario",
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
        "title": "Gemini Commit: Selecionar Modelo de IA",
        "icon": "$(server-process)"
      },
      {
        "command": "aiCommit.setApiKey",
        "title": "Gemini Commit: Configurar Chave de API",
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
      "title": "Gemini Git Commit",
      "properties": {
        "geminiCommit.model": {
          "type": "string",
          "default": "gemini-2.5-flash",
          "enum": [
            "gemini-2.5-flash",
            "gemini-3.8-flash",
            "gemini-3.1-flash-lite",
            "gemini-3.1-pro-preview"
          ],
          "enumDescriptions": [
            "Equilibrado, rápido e eficiente para mensagens de commit (Padrão).",
            "Alta velocidade e compreensão contextual aprimorada.",
            "Ultraleve e menor latência para alterações simples.",
            "Raciocínio aprofundado para diffs complexos e refatorações extensas."
          ],
          "description": "Modelo do Google Gemini a ser utilizado para análise do diff."
        },
        "geminiCommit.maxDiffLength": {
          "type": "number",
          "default": 30000,
          "description": "Tamanho máximo de caracteres do diff enviado à API para controle de contexto."
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run package",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "package": "esbuild ./src/extension.ts --bundle --outfile=dist/extension.js --external:vscode --format=cjs --platform=node --minify",
    "lint": "eslint src --ext ts"
  },
  "dependencies": {
    "@google/genai": "^2.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/vscode": "^1.85.0",
    "esbuild": "^0.25.0",
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
    description: "Implementação principal com integração à vscode.git, SecretStorage, seleção dinâmica de modelos, suporte a contextmenu (botão direito) e preenchimento do inputBox.",
    content: `import * as vscode from 'vscode';
import { GoogleGenAI } from '@google/genai';
import { GitExtension, API as GitAPI, Repository } from './git';

const SECRET_KEY_NAME = 'GEMINI_API_KEY';
const DEFAULT_MODEL = 'gemini-2.5-flash';

let statusBarItem: vscode.StatusBarItem;

/**
 * Ativa a extensão do VS Code
 */
export function activate(context: vscode.ExtensionContext): void {
  // 1. Comando principal de geração de commit com IA
  const generateCommand = vscode.commands.registerCommand(
    'aiCommit.generateCommitMessage',
    async (uriOrSourceControl?: unknown) => {
      await handleGenerateCommitMessage(context, uriOrSourceControl);
    }
  );

  // 2. Comando para selecionar o modelo de IA do Gemini
  const selectModelCommand = vscode.commands.registerCommand(
    'aiCommit.selectModel',
    async () => {
      await promptAndSelectModel();
    }
  );

  // 3. Comando dedicado para redefinir/atualizar a chave de API
  const setApiKeyCommand = vscode.commands.registerCommand(
    'aiCommit.setApiKey',
    async () => {
      await promptAndSaveApiKey(context);
    }
  );

  // 4. Criação do item na Barra de Status (Status Bar)
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = 'aiCommit.selectModel';
  statusBarItem.tooltip = 'Clique para alternar o modelo do Gemini para commits';
  updateStatusBar();
  statusBarItem.show();

  // Atualizar a status bar quando o usuário alterar as configurações
  const configWatcher = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('geminiCommit.model')) {
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

/**
 * Desativa a extensão
 */
export function deactivate(): void {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}

/**
 * Atualiza o texto exibido na barra de status com o modelo atual
 */
function updateStatusBar(): void {
  const config = vscode.workspace.getConfiguration('geminiCommit');
  const currentModel = config.get<string>('model') || DEFAULT_MODEL;
  statusBarItem.text = \`$(sparkle) \${currentModel}\`;
}

/**
 * Exibe QuickPick para seleção do modelo do Google Gemini
 */
async function promptAndSelectModel(): Promise<string | undefined> {
  const config = vscode.workspace.getConfiguration('geminiCommit');
  const currentModel = config.get<string>('model') || DEFAULT_MODEL;

  interface ModelItem extends vscode.QuickPickItem {
    modelId: string;
  }

  const modelOptions: ModelItem[] = [
    {
      label: '$(sparkle) gemini-2.5-flash',
      modelId: 'gemini-2.5-flash',
      description: currentModel === 'gemini-2.5-flash' ? '(Ativo)' : '',
      detail: 'Equilibrado, rápido e altamente eficiente para geração de commits (Padrão).'
    },
    {
      label: '$(zap) gemini-3.8-flash',
      modelId: 'gemini-3.8-flash',
      description: currentModel === 'gemini-3.8-flash' ? '(Ativo)' : '',
      detail: 'Alta velocidade com compreensão contextual e precisão semântica aprimorada.'
    },
    {
      label: '$(rocket) gemini-3.1-flash-lite',
      modelId: 'gemini-3.1-flash-lite',
      description: currentModel === 'gemini-3.1-flash-lite' ? '(Ativo)' : '',
      detail: 'Ultraleve e menor latência para alterações pontuais e rápidas.'
    },
    {
      label: '$(hubot) gemini-3.1-pro-preview',
      modelId: 'gemini-3.1-pro-preview',
      description: currentModel === 'gemini-3.1-pro-preview' ? '(Ativo)' : '',
      detail: 'Raciocínio aprofundado para diffs complexos e refatorações extensas.'
    }
  ];

  const selected = await vscode.window.showQuickPick(modelOptions, {
    placeHolder: 'Selecione o modelo do Gemini para análise do Git diff',
    title: 'Gemini Git Commit: Selecionar Modelo de IA'
  });

  if (!selected) {
    return undefined;
  }

  await config.update('model', selected.modelId, vscode.ConfigurationTarget.Global);
  updateStatusBar();
  vscode.window.showInformationMessage(\`Modelo do Gemini alterado para: \${selected.modelId}\`);
  return selected.modelId;
}

/**
 * Fluxo principal de leitura do diff, consulta à IA e preenchimento do SCM
 */
async function handleGenerateCommitMessage(
  context: vscode.ExtensionContext,
  uriOrSourceControl?: unknown
): Promise<void> {
  try {
    // 1. Obter a API Git integrada do VS Code
    const gitApi = await getGitApi();
    if (!gitApi) {
      vscode.window.showErrorMessage(
        'Extensão Git integrada do VS Code não encontrada ou desativada.'
      );
      return;
    }

    // 2. Localizar o repositório correto no workspace
    const repository = getTargetRepository(gitApi, uriOrSourceControl);
    if (!repository) {
      vscode.window.showErrorMessage(
        'Nenhum repositório Git aberto ou selecionado no workspace atual.'
      );
      return;
    }

    // 3. Extrair o diff (prioriza staged; fallback para unstaged)
    const { diff, isStaged } = await extractGitDiff(repository);
    if (!diff || diff.trim().length === 0) {
      vscode.window.showWarningMessage(
        'Nenhuma alteração Git detectada (staged ou unstaged) para gerar o commit.'
      );
      return;
    }

    // 4. Obter a chave de API segura do SecretStorage
    const apiKey = await getOrPromptApiKey(context);
    if (!apiKey) {
      // Usuário cancelou a inserção da chave
      return;
    }

    // 5. Obter o modelo configurado
    const config = vscode.workspace.getConfiguration('geminiCommit');
    const model = config.get<string>('model') || DEFAULT_MODEL;

    // 6. Executar a chamada à API Gemini com barra de progresso
    const commitMessage = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: isStaged
          ? \`Gemini (\${model}): Analisando alterações em staging...\`
          : \`Gemini (\${model}): Analisando alterações não preparadas (unstaged)...\`,
        cancellable: false
      },
      async (progress) => {
        progress.report({ message: \`Consultando modelo \${model}...\` });
        return await requestCommitMessageFromGemini(apiKey, diff, model);
      }
    );

    if (!commitMessage || commitMessage.trim().length === 0) {
      vscode.window.showErrorMessage('A API do Gemini não retornou mensagem de commit válida.');
      return;
    }

    // 7. Preencher a caixa de texto do Source Control (SCM)
    repository.inputBox.value = commitMessage.trim();
    vscode.window.showInformationMessage(
      isStaged
        ? \`Mensagem de commit gerada com sucesso (\${model}) a partir dos arquivos em staging.\`
        : \`Mensagem de commit gerada com sucesso (\${model}) a partir dos arquivos modificados (unstaged).\`
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(\`Erro ao gerar mensagem de commit com Gemini: \${errorMsg}\`);
  }
}

/**
 * Obtém a extensão nativa vscode.git e sua API versão 1
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
 * Identifica o repositório ativo no workspace (suporta context menu de arquivo ou grupo)
 */
function getTargetRepository(
  gitApi: GitAPI,
  uriOrSourceControl?: unknown
): Repository | undefined {
  if (gitApi.repositories.length === 0) {
    return undefined;
  }

  // Se acionado pelo contextmenu de um item ou grupo específico no SCM
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

  // Tentar encontrar com base no documento ativo no editor
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

  // Fallback padrão: primeiro repositório aberto
  return gitApi.repositories[0];
}

/**
 * Extrai o diff dos arquivos em staging; caso vazio, obtém o diff unstaged
 */
async function extractGitDiff(
  repository: Repository
): Promise<{ diff: string; isStaged: boolean }> {
  // repository.diff(true) executa 'git diff --cached' (staged changes)
  let diff = await repository.diff(true);
  if (diff && diff.trim().length > 0) {
    return { diff, isStaged: true };
  }

  // Fallback para repository.diff(false) que executa 'git diff' (unstaged changes)
  diff = await repository.diff(false);
  return { diff: diff || '', isStaged: false };
}

/**
 * Recupera a chave de API do SecretStorage ou solicita ao usuário com máscara
 */
async function getOrPromptApiKey(
  context: vscode.ExtensionContext
): Promise<string | undefined> {
  const storedKey = await context.secrets.get(SECRET_KEY_NAME);
  if (storedKey && storedKey.trim().length > 0) {
    return storedKey.trim();
  }

  return await promptAndSaveApiKey(context);
}

/**
 * Exibe input box seguro para cadastro ou redefinição da chave de API
 */
async function promptAndSaveApiKey(
  context: vscode.ExtensionContext
): Promise<string | undefined> {
  const currentKey = await context.secrets.get(SECRET_KEY_NAME);
  const input = await vscode.window.showInputBox({
    title: 'Configurar Gemini API Key',
    prompt: 'Cole sua chave de API do Google Gemini para habilitar a geração de commits',
    password: true,
    ignoreFocusOut: true,
    placeHolder: currentKey ? 'Deixe em branco para remover ou digite a nova chave' : 'Ex: AIzaSy...'
  });

  if (input === undefined) {
    // Usuário cancelou pressionando ESC
    return undefined;
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    await context.secrets.delete(SECRET_KEY_NAME);
    vscode.window.showInformationMessage('Chave do Gemini removida com sucesso do cofre de segredos.');
    return undefined;
  }

  await context.secrets.store(SECRET_KEY_NAME, trimmed);
  vscode.window.showInformationMessage('Chave do Gemini salva com sucesso no cofre seguro do sistema.');
  return trimmed;
}

/**
 * Invoca a API oficial do Google Gemini utilizando o SDK @google/genai
 */
async function requestCommitMessageFromGemini(
  apiKey: string,
  gitDiff: string,
  modelName: string = DEFAULT_MODEL
): Promise<string> {
  const config = vscode.workspace.getConfiguration('geminiCommit');
  const maxDiffLength = config.get<number>('maxDiffLength') || 30000;

  // Trunca diffs excessivamente grandes para evitar ultrapassar limites
  const preparedDiff = gitDiff.length > maxDiffLength
    ? \`\${gitDiff.slice(0, maxDiffLength)}\\n\\n[Diff truncado em \${maxDiffLength} caracteres por limite de tamanho]\`
    : gitDiff;

  const ai = new GoogleGenAI({ apiKey });

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

  const response = await ai.models.generateContent({
    model: modelName,
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
 * Remove blocos de markdown e espaços residuais indesejados
 */
function cleanCommitMessage(text: string): string {
  let cleaned = text.trim();
  const mdFence = String.fromCharCode(96, 96, 96);

  // Remove blocos de codigo markdown se o modelo tiver incluido
  if (cleaned.startsWith(mdFence)) {
    cleaned = cleaned.replace(new RegExp('^' + mdFence + '(?:gitcommit|text|markdown)?\\\\s*', 'i'), '');
    cleaned = cleaned.replace(new RegExp('\\\\s*' + mdFence + '$'), '');
  }

  return cleaned.trim();
}`
  },
  {
    name: "src/git.d.ts",
    path: "src/git.d.ts",
    language: "typescript",
    description: "Definições de tipos TypeScript para a extensão integrada vscode.git (necessário para compilação estrita).",
    content: `import { Uri, Event, Disposable } from 'vscode';

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
    description: "Configuração de inicialização e depuração (F5) no Visual Studio Code.",
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
    description: "Tarefas de compilação automáticas executadas antes do início da sessão de depuração.",
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
    name: ".gitignore",
    path: ".gitignore",
    language: "text",
    description: "Arquivos e diretórios ignorados no controle de versão Git da extensão.",
    content: `node_modules
dist
out
*.vsix
.DS_Store
.vscode-test`
  },
  {
    name: "README.md",
    path: "README.md",
    language: "markdown",
    description: "Documentação técnica completa com arquitetura, múltiplos modelos, contextmenu, atalhos, depuração e empacotamento VSIX.",
    content: `# Izy Git Commit Extension

Extensao profissional para o Visual Studio Code que automatiza a criacao de mensagens de commit padronizadas e semanticas (Conventional Commits) atraves dos modelos de inteligencia artificial multimodal do Google Gemini.

Integrada de forma nativa a API Git do VS Code (\`vscode.git\`), a extensao analisa o diff do codigo em tempo real, respeita o staging prioritario e preenche diretamente o campo de texto do Source Control Management (SCM).

---

## Indice

- [Visao Geral](#visao-geral)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Modelos de IA Suportados](#modelos-de-ia-suportados)
- [Arquitetura Tecnica](#arquitetura-tecnica)
- [Estrutura de Diretorios](#estrutura-de-diretorios)
- [Pre-requisitos](#pre-requisitos)
- [Instalacao e Configuracao](#instalacao-e-configuracao)
- [Compilacao e Execucao Local (F5)](#compilacao-e-execucao-local-f5)
- [Como Utilizar](#como-utilizar)
  - [1. Barra de Titulo do Source Control](#1-barra-de-titulo-do-source-control)
  - [2. Menu de Contexto (Botao Direito)](#2-menu-de-contexto-botao-direito)
  - [3. Seletor de Modelos na Barra de Status](#3-seletor-de-modelos-na-barra-de-status)
  - [4. Command Palette](#4-command-palette)
- [Gerenciamento Seguro de Chave de API](#gerenciamento-seguro-de-chave-de-api)
- [Opcoes de Configuracao](#opcoes-de-configuracao)
- [Geracao de Pacote Instalavel (.vsix)](#geracao-de-pacote-instalavel-vsix)
- [Tratamento de Excecoes e Casos de Borda](#tratamento-de-excecoes-e-casos-de-borda)
- [Licenca](#licenca)

---

## Visao Geral

A preparacao manual de commits detalhados frequentemente consome tempo valioso de desenvolvimento ou resulta em mensagens genericas como "ajustes" ou "update".

A **Izy Git Commit Extension** resolve este gargalo com precisao de engenharia:
- Inspeciona o \`diff\` exato das alteracoes preparadas em staging (\`git diff --cached\`).
- Se nenhuma alteracao estiver em staging, executa fallback suave para os arquivos modificados na working tree (\`git diff\`).
- Envia o diff estruturado com instrucoes estritas ao modelo de IA selecionado.
- Formata a resposta rigorosamente no padrao Conventional Commits (\`tipo(escopo): descricao\` + topicos com marcadores em hifen).
- Injeta o texto diretamente na propriedade \`repository.inputBox.value\` do SCM nativo.

---

## Funcionalidades Principais

- **Integracao Git Nativa**: Acesso direto a extensao embutida \`vscode.git\` sem necessidade de spawn de subprocessos de terminal externos.
- **Deteccao Inteligente de Staging**: Prioridade absoluta para alteracoes em staging, garantindo que apenas arquivos revisados componham a mensagem de commit.
- **Suporte a Context Menu (Botao Direito)**:
  - Botao direito sobre o grupo "Staged Changes" ou "Changes".
  - Botao direito sobre qualquer arquivo individual da lista do SCM.
  - Botao direito dentro do editor de codigo ou no visualizador de diff.
- **Atalho Rapido $(sparkle)**: Botao com icone de faisca integrado a barra de ferramentas do Source Control (\`scm/title\`).
- **Seletor de Modelos Dinamico**: Alternancia rapida entre multiplos modelos do Gemini atraves da Barra de Status inferior ou via QuickPick (\`Ctrl+Shift+P\`).
- **Cofre de Segredos Criptografado**: Utilizacao de \`context.secrets\` (\`vscode.SecretStorage\`) para armazenar a \`GEMINI_API_KEY\`, isolada de arquivos de texto claro ou do historico do Git.
- **Controle de Janela de Contexto**: Truncamento seguro de diffs extensos para prevenir estouro de cota de tokens ou latencia excessiva.
- **Feedback Visual de Progresso**: Utilizacao de \`vscode.window.withProgress\` para notificar o usuario de forma nao obstrutiva durante a chamada a API.

---

## Modelos de IA Suportados

A extensao integra-se ao SDK oficial \`@google/genai\` (v2.4.0+) e suporta os seguintes modelos configuraveis:

- **gemini-2.5-flash** (Padrao): Modelo recomendado para a grande maioria dos repositorios. Excelente relacao entre velocidade, custo e compreensao contextual de mudancas de codigo.
- **gemini-3.8-flash**: Maior precisao semantica e entendimento de refatoracoes distribuidas em multiplos arquivos.
- **gemini-3.1-flash-lite**: Menor latencia possivel, ideal para micro-commits pontuais e ajustes cosmeticos continuos.
- **gemini-3.1-pro-preview**: Modelo com raciocinio profundo para grandes diffs de arquitetura, refatoracoes de banco de dados e migracao de frameworks.

---

## Arquitetura Tecnica

- **Linguagem**: TypeScript 5.3+ com tipagem estrita (\`strict: true\`).
- **Runtime**: Node.js integrado ao host do Visual Studio Code.
- **Bundler**: \`esbuild\` para geracao de bundle unico em \`dist/extension.js\` (tempo de boot instantaneo e menor consumo de memoria).
- **APIs de Plataforma**:
  - \`vscode.extensions.getExtension('vscode.git')\`: Acesso aos objetos de repositorio, estado e controle de entrada.
  - \`vscode.SecretStorage\`: Persistencia segura no Keychain (macOS), Secret Service / libsecret (Linux) ou Credential Manager (Windows).
  - \`vscode.window.createStatusBarItem\`: Feedback e gatilho de selecao de modelo no rodape da IDE.
  - \`vscode.window.showQuickPick\`: Interface de selecao interativa com detalhes de cada modelo.
  - \`vscode.window.withProgress\`: Notificacao animada de carregamento.
- **SDK de IA**: \`@google/genai\` utilizando o metodo \`ai.models.generateContent\` com \`systemInstruction\` dedicada.

---

## Estrutura de Diretorios

\`\`\`
gemini-git-commit/
├── .vscode/
│   ├── launch.json          # Configuracao para depuracao interativa (F5)
│   └── tasks.json           # Tarefas de compilacao automatica com esbuild
├── dist/
│   └── extension.js         # Bundle compilado gerado pelo esbuild
├── src/
│   ├── extension.ts         # Ponto de entrada e logica da extensao
│   └── git.d.ts             # Definicoes de tipos da API nativa vscode.git
├── .gitignore               # Exclusao de node_modules, dist e pacotes vsix
├── package.json             # Metadados, comandos, menus, configuracoes e dependencias
├── README.md                # Documentacao tecnica detalhada
└── tsconfig.json            # Configuracao do compilador TypeScript
\`\`\`

---

## Pre-requisitos

Antes de iniciar, certifique-se de possuir em seu ambiente:
- **Node.js**: Versao 18.0.0 ou superior (recomendado 20 LTS).
- **npm**: Versao 9.0.0 ou superior.
- **Visual Studio Code**: Versao 1.85.0 ou superior.
- **Git**: Instalado e acessivel no PATH do sistema.
- **Chave de API do Google Gemini**: Obtida gratuitamente no Google AI Studio (https://aistudio.google.com).

---

## Instalacao e Configuracao

1. Clone o repositorio ou crie a pasta do projeto:
\`\`\`bash
git clone https://github.com/seu-usuario/gemini-git-commit.git
cd gemini-git-commit
\`\`\`

2. Instale as dependencias necessarias:
\`\`\`bash
npm install
\`\`\`

---

## Compilacao e Execucao Local (F5)

Para testar a extensao em ambiente de desenvolvimento com o Extension Development Host do VS Code:

1. Compile o projeto com o bundler \`esbuild\`:
\`\`\`bash
npm run package
\`\`\`

2. Caso deseje manter a compilacao automatica a cada alteracao no codigo TypeScript:
\`\`\`bash
npm run watch
\`\`\`

3. Abra o diretorio raiz no VS Code:
\`\`\`bash
code .
\`\`\`

4. Pressione a tecla **F5** (ou navegue ate o menu superior: **Executar -> Iniciar Depuracao**).
- Uma nova janela intitulada **[Extension Development Host]** sera aberta com a extensao ativa e isolada do seu ambiente principal.

---

## Como Utilizar

### 1. Barra de Titulo do Source Control
- Na janela de desenvolvimento (F5), abra qualquer projeto que seja um repositorio Git com alteracoes pendentes.
- Acesse o painel de Source Control pelo atalho \`Ctrl+Shift+G\` (Windows/Linux) ou \`Cmd+Shift+G\` (macOS).
- Localize o icone de faisca \`$(sparkle)\` na barra de titulo do Git e clique nele.
- Na primeira execucao, caso a chave nao esteja gravada, informe a sua \`GEMINI_API_KEY\`.
- A mensagem sera gerada e preenchida diretamente no campo de texto de commit.

### 2. Menu de Contexto (Botao Direito)
- **Sobre um arquivo especifico**: Clique com o botao direito em um arquivo alterado na lista do SCM e selecione \`Gerar Mensagem de Commit com IA\`.
- **Sobre o grupo Staged Changes ou Changes**: Clique com o botao direito no cabecalho da secao para gerar o commit de todas as alteracoes do grupo.
- **No Editor de Codigo**: Clique com o botao direito sobre o editor de um arquivo aberto e selecione \`Gerar Mensagem de Commit com IA\`.

### 3. Seletor de Modelos na Barra de Status
- No canto inferior esquerdo da janela do VS Code, localize o item \`$(sparkle) gemini-2.5-flash\`.
- Clique sobre ele para abrir o QuickPick com a lista de modelos disponiveis.
- Selecione o modelo desejado (\`gemini-2.5-flash\`, \`gemini-3.8-flash\`, \`gemini-3.1-flash-lite\` ou \`gemini-3.1-pro-preview\`).
- A extensao salva automaticamente a sua escolha e atualiza a barra de status.

### 4. Command Palette
Pressione \`Ctrl+Shift+P\` (ou \`Cmd+Shift+P\`) para acessar os comandos registrados:
- \`Gerar Mensagem de Commit com IA\`: Dispara a analise do diff atual.
- \`Gemini Commit: Selecionar Modelo de IA\`: Abre a lista interativa de modelos.
- \`Gemini Commit: Configurar Chave de API\`: Abre a caixa de dialogo com mascara para cadastrar, atualizar ou remover a credencial.

---

## Gerenciamento Seguro de Chave de API

A extensao adota as melhores praticas de seguranca da Microsoft para extensoes do VS Code:
- A chave de API nunca e gravada em arquivos de texto plano (\`settings.json\`, \`.env\` ou \`package.json\`).
- Os dados sao gerenciados via \`vscode.SecretStorage\` (\`context.secrets\`), que utiliza a infraestrutura de cofre de credenciais nativa do sistema operacional.
- Para alterar ou excluir a chave armazenada, execute o comando \`aiCommit.setApiKey\` pela Command Palette. Deixar o campo vazio e pressionar Enter remove a credencial do cofre.

---

## Opcoes de Configuracao

As configuracoes da extensao podem ser personalizadas no arquivo \`settings.json\` do VS Code:

\`\`\`json
{
  "geminiCommit.model": "gemini-2.5-flash",
  "geminiCommit.maxDiffLength": 30000
}
\`\`\`

- \`geminiCommit.model\`: Define o modelo padrao utilizado para inspecao do diff (\`gemini-2.5-flash\`, \`gemini-3.8-flash\`, \`gemini-3.1-flash-lite\` ou \`gemini-3.1-pro-preview\`).
- \`geminiCommit.maxDiffLength\`: Limite maximo de caracteres do diff a serem enviados para a API (padrao: 30000 caracteres), evitando latencias excessivas em commits de grande porte.

---

## Padrao de Mensagem Gerada (Conventional Commits)

As mensagens geradas pela IA respeitam rigorosamente a convencao Conventional Commits:

\`\`\`text
feat(auth): implementar geracao e validacao de tokens jwt

- adicionar servico central de geracao para access token e refresh token
- incluir middleware de autenticacao com validacao de header bearer
- definir tipagem estrita para token payload com userId e role
\`\`\`

Regras estritas aplicadas pelo system instruction do modelo:
- Linha 1: Formato \`tipo(escopo): descricao concisa no imperativo\` com limite de ate 72 caracteres.
- Tipos validos: \`feat\`, \`fix\`, \`refactor\`, \`perf\`, \`test\`, \`docs\`, \`style\`, \`build\`, \`ci\`, \`chore\` e \`revert\`.
- Linha 2: Linha em branco obrigatoria para compatibilidade com o leitor de logs do Git.
- Linhas seguintes: Topicos detalhando as mudancas tecnicas, utilizando exclusivamente hifens (-) como marcadores.
- Ausencia de blocos de markdown (\`\`\`) ou frases introdutorias.

---

## Geracao de Pacote Instalavel (.vsix)

Caso deseje empacotar a extensao para instalacao offline ou distribuicao na equipe:

1. Instale a ferramenta oficial \`@vscode/vsce\`:
\`\`\`bash
npm install -g @vscode/vsce
\`\`\`

2. Gere o pacote binario \`.vsix\`:
\`\`\`bash
npx @vscode/vsce package
\`\`\`

3. Instale a extensao gerada em sua instancia principal do VS Code:
\`\`\`bash
code --install-extension gemini-git-commit-1.1.0.vsix
\`\`\`

---

## Tratamento de Excecoes e Casos de Borda

A extensao contempla os seguintes cenarios de execucao:
- **Git desinstalado ou desativado**: Notificacao clara indicando a ausencia da extensao integrada \`vscode.git\`.
- **Nenhum repositorio aberto**: Alerta solicitando a abertura de uma pasta com repositorio Git ativo.
- **Diff vazio**: Deteccao automatica e alerta caso nao existam modificacoes pendentes nem em staging nem na working tree.
- **Diff excessivamente grande**: Truncamento inteligente no limite configurado (\`maxDiffLength\`) com aviso no prompt para evitar erros de limite de cota.
- **Cancelamento de chave**: Se o usuario cancelar a solicitacao de chave, o fluxo e interrompido sem erros residuais no console.
- **Falha de rede ou timeout**: Notificacao descritiva capturando mensagens de erro da API do Gemini.

---

## Licenca

Este projeto e distribuido sob a licenca MIT. Consulte o arquivo de licenca para maiores detalhes.`
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
