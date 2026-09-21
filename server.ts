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

  // API endpoint para teste e simulação de geração de commit com Gemini
  app.post("/api/generate-commit", async (req, res) => {
    try {
      const { diff, customApiKey, model } = req.body;
      if (!diff || typeof diff !== "string" || diff.trim().length === 0) {
        return res.status(400).json({ error: "Diff do Git não fornecido ou vazio." });
      }

      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "Chave GEMINI_API_KEY não configurada no ambiente ou na solicitação.",
          requiresKey: true,
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

      const selectedModel = model || "gemini-2.5-flash";

      const systemInstruction = `Você é um especialista em Git e Conventional Commits.
Sua tarefa é analisar o git diff fornecido e gerar uma mensagem de commit de alta qualidade, precisa, técnica e concisa.

Regras estritas de formatação:
1. Linha 1: Título no formato Conventional Commits: tipo(escopo opcional): descrição curta no imperativo (máximo 72 caracteres).
   Tipos válidos: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
2. Linha 2: Obrigatoriamente em branco.
3. Linhas seguintes: Tópicos detalhando as alterações técnicas, usando exclusivamente hífens (-) como marcadores.
4. Jamais adicione blocos de código markdown (\`\`\`), preâmbulos, saudações ou explicações fora da mensagem de commit.
5. Use apenas hifens (-) para listas e pontuações, nunca travessões. Mantenha um tom direto e profissional.`;

      const prompt = `Analise o seguinte git diff e gere a mensagem de commit correspondente seguindo rigorosamente as instruções:\n\n${diff.slice(0, 30000)}`;

      const response = await client.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      const commitMessage = response.text ? response.text.trim() : "";
      return res.json({ commitMessage, modelUsed: selectedModel });
    } catch (err: any) {
      console.error("Erro ao gerar commit:", err);
      return res.status(500).json({
        error: err?.message || "Falha ao processar diff com a API Gemini.",
      });
    }
  });

  // Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
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
