/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Copy, Check, Upload } from 'lucide-react';

export default function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setResult(data.result);
    } catch (err: any) {
      alert('產生失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '檔案上傳失敗');
      }
      
      const data = await response.json();
      setInput(data.text);
      alert('檔案解析成功！');
    } catch (err: any) {
      alert('檔案解析失敗：' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">會議記錄小幫手</h1>
        <p className="text-slate-600 mt-1">簡化您的工作流程，將逐字稿或檔案轉化為清晰總結。</p>
      </header>

      <main className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">Input</h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
            >
              <Upload className="w-4 h-4" />
              {uploading ? '上傳中...' : '上傳 Word'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".docx"
              className="hidden"
            />
          </div>
          <textarea
            className="w-full flex-grow h-96 p-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 transition"
            placeholder="請在此貼上會議逐字稿內容，或上傳檔案..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? '生成中...' : '生成總結與翻譯'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h2 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">AI 生成結果</h2>
            {result && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 font-medium transition"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '已複製' : '複製內容'}
              </button>
            )}
          </div>
          <div className="markdown-body text-slate-700 leading-relaxed overflow-y-auto">
            {result ? (
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-slate-400 italic">在此處查看生成的 AI 總結與翻譯...</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

