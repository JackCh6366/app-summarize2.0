# 會議記錄小幫手 2.0 (Meeting Summarizer 2.0)

這是一個基於 React、Express 和 Google Gemini API 的全端應用程式，能夠自動解析上傳的 Word (`.docx`) 檔案，並產生專業的會議記錄（包含總結與待辦事項），並提供英文翻譯版本。

## 環境需求

- [Node.js](https://nodejs.org/) (建議使用 v18 以上版本)

## 安裝與設定

1. 安裝所有依賴套件：
   ```bash
   npm install
   ```

2. 環境變數設定：
   複製 `.env.example` 檔案並重新命名為 `.env`，然後填入你的 Gemini API Key：
   ```bash
   cp .env.example .env
   ```
   在 `.env` 中設定：
   ```env
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
   ```

## 開發環境運行

執行以下指令即可啟動包含前後端的開發伺服器：
```bash
npm run dev
```
啟動後請在瀏覽器開啟 [http://localhost:3000](http://localhost:3000)

## 生產環境建置與部署

1. 建立前端與後端生產環境版本：
   ```bash
   npm run build
   ```
2. 啟動生產環境伺服器：
   ```bash
   npm start
   ```
