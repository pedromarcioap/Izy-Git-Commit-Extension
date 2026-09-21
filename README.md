# Izy Git Commit Extension

Extensao profissional para o Visual Studio Code que automatiza a criacao de mensagens de commit padronizadas e semanticas (Conventional Commits) atraves dos modelos de inteligencia artificial multimodal do Google Gemini.

Integrada de forma nativa a API Git do VS Code (`vscode.git`), a extensao analisa o diff do codigo em tempo real, respeita o staging prioritario e preenche diretamente o campo de texto do Source Control Management (SCM).

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
- Inspeciona o `diff` exato das alteracoes preparadas em staging (`git diff --cached`).
- Se nenhuma alteracao estiver em staging, executa fallback suave para os arquivos modificados na working tree (`git diff`).
- Envia o diff estruturado com instrucoes estritas ao modelo de IA selecionado.
- Formata a resposta rigorosamente no padrao Conventional Commits (`tipo(escopo): descricao` + topicos com marcadores em hifen).
- Injeta o texto diretamente na propriedade `repository.inputBox.value` do SCM nativo.

---

## Funcionalidades Principais

- **Integracao Git Nativa**: Acesso direto a extensao embutida `vscode.git` sem necessidade de spawn de subprocessos de terminal externos.
- **Deteccao Inteligente de Staging**: Prioridade absoluta para alteracoes em staging, garantindo que apenas arquivos revisados componham a mensagem de commit.
- **Suporte a Context Menu (Botao Direito)**:
  - Botao direito sobre o grupo "Staged Changes" ou "Changes".
  - Botao direito sobre qualquer arquivo individual da lista do SCM.
  - Botao direito dentro do editor de codigo ou no visualizador de diff.
- **Atalho Rapido $(sparkle)**: Botao com icone de faisca integrado a barra de ferramentas do Source Control (`scm/title`).
- **Seletor de Modelos Dinamico**: Alternancia rapida entre multiplos modelos do Gemini atraves da Barra de Status inferior ou via QuickPick (`Ctrl+Shift+P`).
- **Cofre de Segredos Criptografado**: Utilizacao de `context.secrets` (`vscode.SecretStorage`) para armazenar a `GEMINI_API_KEY`, isolada de arquivos de texto claro ou do historico do Git.
- **Controle de Janela de Contexto**: Truncamento seguro de diffs extensos para prevenir estouro de cota de tokens ou latencia excessiva.
- **Feedback Visual de Progresso**: Utilizacao de `vscode.window.withProgress` para notificar o usuario de forma nao obstrutiva durante a chamada a API.

---

## Modelos de IA Suportados

A extensao integra-se ao SDK oficial `@google/genai` (v2.4.0+) e suporta os seguintes modelos configuraveis:

- **gemini-2.5-flash** (Padrao): Modelo recomendado para a grande maioria dos repositorios. Excelente relacao entre velocidade, custo e compreensao contextual de mudancas de codigo.
- **gemini-3.8-flash**: Maior precisao semantica e entendimento de refatoracoes distribuidas em multiplos arquivos.
- **gemini-3.1-flash-lite**: Menor latencia possivel, ideal para micro-commits pontuais e ajustes cosmeticos continuos.
- **gemini-3.1-pro-preview**: Modelo com raciocinio profundo para grandes diffs de arquitetura, refatoracoes de banco de dados e migracao de frameworks.

---

## Arquitetura Tecnica

- **Linguagem**: TypeScript 5.3+ com tipagem estrita (`strict: true`).
- **Runtime**: Node.js integrado ao host do Visual Studio Code.
- **Bundler**: `esbuild` para geracao de bundle unico em `dist/extension.js` (tempo de boot instantaneo e menor consumo de memoria).
- **APIs de Plataforma**:
  - `vscode.extensions.getExtension('vscode.git')`: Acesso aos objetos de repositorio, estado e controle de entrada.
  - `vscode.SecretStorage`: Persistencia segura no Keychain (macOS), Secret Service / libsecret (Linux) ou Credential Manager (Windows).
  - `vscode.window.createStatusBarItem`: Feedback e gatilho de selecao de modelo no rodape da IDE.
  - `vscode.window.showQuickPick`: Interface de selecao interativa com detalhes de cada modelo.
  - `vscode.window.withProgress`: Notificacao animada de carregamento.
- **SDK de IA**: `@google/genai` utilizando o metodo `ai.models.generateContent` com `systemInstruction` dedicada.

---

## Estrutura de Diretorios

```
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
```

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
```bash
git clone https://github.com/seu-usuario/gemini-git-commit.git
cd gemini-git-commit
```

2. Instale as dependencias necessarias:
```bash
npm install
```

---

## Compilacao e Execucao Local (F5)

Para testar a extensao em ambiente de desenvolvimento com o Extension Development Host do VS Code:

1. Compile o projeto com o bundler `esbuild`:
```bash
npm run package
```

2. Caso deseje manter a compilacao automatica a cada alteracao no codigo TypeScript:
```bash
npm run watch
```

3. Abra o diretorio raiz no VS Code:
```bash
code .
```

4. Pressione a tecla **F5** (ou navegue ate o menu superior: **Executar -> Iniciar Depuracao**).
- Uma nova janela intitulada **[Extension Development Host]** sera aberta com a extensao ativa e isolada do seu ambiente principal.

---

## Como Utilizar

### 1. Barra de Titulo do Source Control
- Na janela de desenvolvimento (F5), abra qualquer projeto que seja um repositorio Git com alteracoes pendentes.
- Acesse o painel de Source Control pelo atalho `Ctrl+Shift+G` (Windows/Linux) ou `Cmd+Shift+G` (macOS).
- Localize o icone de faisca `$(sparkle)` na barra de titulo do Git e clique nele.
- Na primeira execucao, caso a chave nao esteja gravada, informe a sua `GEMINI_API_KEY`.
- A mensagem sera gerada e preenchida diretamente no campo de texto de commit.

### 2. Menu de Contexto (Botao Direito)
- **Sobre um arquivo especifico**: Clique com o botao direito em um arquivo alterado na lista do SCM e selecione `Gerar Mensagem de Commit com IA`.
- **Sobre o grupo Staged Changes ou Changes**: Clique com o botao direito no cabecalho da secao para gerar o commit de todas as alteracoes do grupo.
- **No Editor de Codigo**: Clique com o botao direito sobre o editor de um arquivo aberto e selecione `Gerar Mensagem de Commit com IA`.

### 3. Seletor de Modelos na Barra de Status
- No canto inferior esquerdo da janela do VS Code, localize o item `$(sparkle) gemini-2.5-flash`.
- Clique sobre ele para abrir o QuickPick com a lista de modelos disponiveis.
- Selecione o modelo desejado (`gemini-2.5-flash`, `gemini-3.8-flash`, `gemini-3.1-flash-lite` ou `gemini-3.1-pro-preview`).
- A extensao salva automaticamente a sua escolha e atualiza a barra de status.

### 4. Command Palette
Pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P`) para acessar os comandos registrados:
- `Gerar Mensagem de Commit com IA`: Dispara a analise do diff atual.
- `Gemini Commit: Selecionar Modelo de IA`: Abre a lista interativa de modelos.
- `Gemini Commit: Configurar Chave de API`: Abre a caixa de dialogo com mascara para cadastrar, atualizar ou remover a credencial.

---

## Gerenciamento Seguro de Chave de API

A extensao adota as melhores praticas de seguranca da Microsoft para extensoes do VS Code:
- A chave de API nunca e gravada em arquivos de texto plano (`settings.json`, `.env` ou `package.json`).
- Os dados sao gerenciados via `vscode.SecretStorage` (`context.secrets`), que utiliza a infraestrutura de cofre de credenciais nativa do sistema operacional.
- Para alterar ou excluir a chave armazenada, execute o comando `aiCommit.setApiKey` pela Command Palette. Deixar o campo vazio e pressionar Enter remove a credencial do cofre.

---

## Opcoes de Configuracao

As configuracoes da extensao podem ser personalizadas no arquivo `settings.json` do VS Code:

```json
{
  "geminiCommit.model": "gemini-2.5-flash",
  "geminiCommit.maxDiffLength": 30000
}
```

- `geminiCommit.model`: Define o modelo padrao utilizado para inspecao do diff (`gemini-2.5-flash`, `gemini-3.8-flash`, `gemini-3.1-flash-lite` ou `gemini-3.1-pro-preview`).
- `geminiCommit.maxDiffLength`: Limite maximo de caracteres do diff a serem enviados para a API (padrao: 30000 caracteres), evitando latencias excessivas em commits de grande porte.

---

## Padrao de Mensagem Gerada (Conventional Commits)

As mensagens geradas pela IA respeitam rigorosamente a convencao Conventional Commits:

```text
feat(auth): implementar geracao e validacao de tokens jwt

- adicionar servico central de geracao para access token e refresh token
- incluir middleware de autenticacao com validacao de header bearer
- definir tipagem estrita para token payload com userId e role
```

Regras estritas aplicadas pelo system instruction do modelo:
- Linha 1: Formato `tipo(escopo): descricao concisa no imperativo` com limite de ate 72 caracteres.
- Tipos validos: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `build`, `ci`, `chore` e `revert`.
- Linha 2: Linha em branco obrigatoria para compatibilidade com o leitor de logs do Git.
- Linhas seguintes: Topicos detalhando as mudancas tecnicas, utilizando exclusivamente hifens (-) como marcadores.
- Ausencia de blocos de markdown (\`\`\`) ou frases introdutorias.

---

## Geracao de Pacote Instalavel (.vsix)

Caso deseje empacotar a extensao para instalacao offline ou distribuicao na equipe:

1. Instale a ferramenta oficial `@vscode/vsce`:
```bash
npm install -g @vscode/vsce
```

2. Gere o pacote binario `.vsix`:
```bash
npx @vscode/vsce package
```

3. Instale a extensao gerada em sua instancia principal do VS Code:
```bash
code --install-extension gemini-git-commit-1.1.0.vsix
```

---

## Tratamento de Excecoes e Casos de Borda

A extensao contempla os seguintes cenarios de execucao:
- **Git desinstalado ou desativado**: Notificacao clara indicando a ausencia da extensao integrada `vscode.git`.
- **Nenhum repositorio aberto**: Alerta solicitando a abertura de uma pasta com repositorio Git ativo.
- **Diff vazio**: Deteccao automatica e alerta caso nao existam modificacoes pendentes nem em staging nem na working tree.
- **Diff excessivamente grande**: Truncamento inteligente no limite configurado (`maxDiffLength`) com aviso no prompt para evitar erros de limite de cota.
- **Cancelamento de chave**: Se o usuario cancelar a solicitacao de chave, o fluxo e interrompido sem erros residuais no console.
- **Falha de rede ou timeout**: Notificacao descritiva capturando mensagens de erro da API do Gemini.

---

## Licenca

Este projeto e distribuido sob a licenca MIT. Consulte o arquivo de licenca para maiores detalhes.
