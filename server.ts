import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import multer from 'multer';
import mammoth from 'mammoth';
// @ts-ignore
// const pdf = require('pdf-parse'); // PDF support disabled

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for file upload
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    console.log("File received:", file.originalname, file.mimetype, file.size);

    try {
      let text = "";
      if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        text = result.value;
        console.log("DOCX parsed, length:", text.length);
      } else {
        console.log("Unsupported mimetype:", file.mimetype);
        return res.status(400).json({ error: "Unsupported file type: " + file.mimetype });
      }
      res.json({ text });
    } catch (err) {
      console.error("File parsing error:", err);
      res.status(500).json({ error: "File parsing failed: " + (err as Error).message });
    }
  });

  // API routes FIRST
  app.post("/api/generate", async (req, res) => {
    const { prompt } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const systemInstruction = `
        你是一位專業的會議記錄助理。請根據使用者提供的會議逐字稿，整理出結構化的會議紀錄。
        請務必遵守以下輸出格式要求：

        1. **會議主題與時間**：擷取會議的主題與時間。
        2. **與會者**：列出參與會議的人員。
        3. **會議重點總結**：用 3 到 5 個重點總結會議內容。
        4. **Action Items (待辦事項)**：明確列出接下來的待辦事項與負責人。
        5. **英文翻譯版**：將上述 1~4 點的內容完整翻譯成專業的英文。

        請以 Markdown 格式輸出，所有繁體中文部分必須使用繁體中文回覆，不要包含任何額外的問候語或結語。
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      res.json({ result: response.text });
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "Failed to generate meeting minutes" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
