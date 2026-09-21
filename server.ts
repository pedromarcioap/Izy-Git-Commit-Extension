import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API endpoint para teste e simulação de geração de commit multi-provedor
  app.post("/api/generate-commit", async (req, res) => {
    try {
      const { diff, customApiKey, model, provider, customEndpoint } = req.body;
      if (!diff || typeof diff !== "string" || diff.trim().length === 0) {
        return res.status(400).json({ error: "Diff do Git não fornecido ou vazio." });
      }

      const activeProvider = provider || (model?.includes("/") ? "openrouter" : model?.startsWith("claude") ? "claude" : model?.startsWith("deepseek") ? "deepseek" : "gemini");
      const selectedModel = model || "gemini-2.5-flash";

      const systemInstruction = `Você é um Engenheiro de Software Sênior especialista em Git e Conventional Commits.
Sua tarefa é analisar o git diff fornecido e retornar exclusivamente a mensagem de commit pronta para uso.

Regras estritas de formatação:
1. Linha 1: Título no formato Conventional Commits: tipo(escopo opcional): descrição curta no imperativo (máximo 72 caracteres).
   Tipos válidos: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
2. Linha 2: Obrigatoriamente em branco.
3. Linhas seguintes: Tópicos detalhando as alterações técnicas, usando exclusivamente hífens (-) como marcadores.
4. Jamais adicione blocos de código markdown (\`\`\`), preâmbulos, saudações ou explicações fora da mensagem de commit.
5. Use apenas hifens (-) para listas e pontuações, nunca travessões. Mantenha um tom direto e profissional.`;

      const prompt = `Analise o seguinte git diff e gere a mensagem de commit correspondente seguindo rigorosamente as instruções:\n\n${diff.slice(0, 30000)}`;

      let commitMessage = "";

      if (activeProvider === "gemini") {
        const apiKey = customApiKey || process.env.GEMINI_API_KEY;
        if (!apiKey) {
          return res.status(400).json({
            error: "Chave GEMINI_API_KEY não configurada no ambiente ou no simulador.",
            requiresKey: true,
            provider: "gemini"
          });
        }

        const client = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        const response = await client.models.generateContent({
          model: selectedModel,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });

        commitMessage = response.text ? response.text.trim() : "";
      } else if (activeProvider === "openrouter" || activeProvider === "deepseek" || activeProvider === "custom") {
        let endpoint = "https://openrouter.ai/api/v1/chat/completions";
        let headers: Record<string, string> = { "Content-Type": "application/json" };

        if (activeProvider === "openrouter") {
          endpoint = "https://openrouter.ai/api/v1/chat/completions";
          const apiKey = customApiKey || process.env.OPENROUTER_API_KEY;
          if (!apiKey) {
            return res.status(400).json({
              error: "Chave OPENROUTER_API_KEY necessária para usar DeepSeek, Qwen ou Claude via OpenRouter.",
              requiresKey: true,
              provider: "openrouter"
            });
          }
          headers["Authorization"] = `Bearer ${apiKey}`;
          headers["HTTP-Referer"] = "https://github.com/pedromarcio/izy-git-commit";
          headers["X-Title"] = "Izy Git Commit";
        } else if (activeProvider === "deepseek") {
          endpoint = "https://api.deepseek.com/chat/completions";
          const apiKey = customApiKey || process.env.DEEPSEEK_API_KEY;
          if (!apiKey) {
            return res.status(400).json({
              error: "Chave DEEPSEEK_API_KEY necessária para chamar a API direta da DeepSeek.",
              requiresKey: true,
              provider: "deepseek"
            });
          }
          headers["Authorization"] = `Bearer ${apiKey}`;
        } else if (activeProvider === "custom") {
          endpoint = customEndpoint || "http://localhost:11434/v1/chat/completions";
          if (customApiKey) {
            headers["Authorization"] = `Bearer ${customApiKey}`;
          }
        }

        const fetchResponse = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: prompt }
            ],
            temperature: 0.2
          })
        });

        if (!fetchResponse.ok) {
          const errText = await fetchResponse.text();
          throw new Error(`Erro do provedor ${activeProvider} (${fetchResponse.status}): ${errText}`);
        }

        const data = (await fetchResponse.json()) as any;
        commitMessage = data.choices?.[0]?.message?.content || "";
      } else if (activeProvider === "claude") {
        const apiKey = customApiKey || process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          return res.status(400).json({
            error: "Chave ANTHROPIC_API_KEY necessária para a API direta da Anthropic Claude.",
            requiresKey: true,
            provider: "claude"
          });
        }

        const fetchResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: selectedModel,
            max_tokens: 1024,
            temperature: 0.2,
            system: systemInstruction,
            messages: [{ role: "user", content: prompt }]
          })
        });

        if (!fetchResponse.ok) {
          const errText = await fetchResponse.text();
          throw new Error(`Erro Anthropic Claude (${fetchResponse.status}): ${errText}`);
        }

        const data = (await fetchResponse.json()) as any;
        const textBlock = data.content?.find((c: any) => c.type === "text");
        commitMessage = textBlock?.text || "";
      }

      // Limpar blocos de código se presentes
      let cleaned = commitMessage.trim();
      const mdFence = "```";
      if (cleaned.startsWith(mdFence)) {
        cleaned = cleaned.replace(/^```(?:gitcommit|text|markdown)?\s*/i, "");
        cleaned = cleaned.replace(/\s*```$/, "");
      }

      return res.json({
        commitMessage: cleaned.trim(),
        modelUsed: selectedModel,
        providerUsed: activeProvider
      });
    } catch (err: any) {
      console.error("Erro ao gerar commit:", err);
      return res.status(500).json({
        error: err?.message || "Falha ao processar diff com a IA.",
      });
    }
  });

  // Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      openRouterConfigured: !!process.env.OPENROUTER_API_KEY,
      deepseekConfigured: !!process.env.DEEPSEEK_API_KEY,
      claudeConfigured: !!process.env.ANTHROPIC_API_KEY
    });
  });

  // Vite middleware para desenvolvimento e estáticos para produção
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor ativo na porta ${PORT}`);
  });
}

startServer();
