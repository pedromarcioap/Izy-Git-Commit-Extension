import * as vscode from 'vscode';
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
  statusBarItem.text = `$(sparkle) ${currentModel}`;
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
  vscode.window.showInformationMessage(`Modelo do Gemini alterado para: ${selected.modelId}`);
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
          ? `Gemini (${model}): Analisando alterações em staging...`
          : `Gemini (${model}): Analisando alterações não preparadas (unstaged)...`,
        cancellable: false
      },
      async (progress) => {
        progress.report({ message: `Consultando modelo ${model}...` });
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
        ? `Mensagem de commit gerada com sucesso (${model}) a partir dos arquivos em staging.`
        : `Mensagem de commit gerada com sucesso (${model}) a partir dos arquivos modificados (unstaged).`
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Erro ao gerar mensagem de commit com Gemini: ${errorMsg}`);
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
    ? `${gitDiff.slice(0, maxDiffLength)}\n\n[Diff truncado em ${maxDiffLength} caracteres por limite de tamanho]`
    : gitDiff;

  const ai = new GoogleGenAI({ apiKey });

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
    cleaned = cleaned.replace(new RegExp('^' + mdFence + '(?:gitcommit|text|markdown)?\\s*', 'i'), '');
    cleaned = cleaned.replace(new RegExp('\\s*' + mdFence + '$'), '');
  }

  return cleaned.trim();
}
