'use client';

import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import type { Framework } from '@/lib/store';

interface CodeEditorProps {
  code: string;
  framework: Framework;
  onChange?: (value: string) => void;
}

const FRAMEWORK_LANGUAGES: Record<Framework, string> = {
  'html-tailwind': 'html',
  'plain-html': 'html',
  react: 'typescript',
  vue: 'html',
};

export default function CodeEditor({ code, framework, onChange }: CodeEditorProps) {
  const [readOnly, setReadOnly] = useState(true);
  const [copied, setCopied] = useState(false);

  const language = FRAMEWORK_LANGUAGES[framework];

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  }, [code]);

  const toggleReadOnly = useCallback(() => {
    setReadOnly((prev) => !prev);
  }, []);

  return (
    <div className="flex flex-col h-full border border-[#E8E8E8] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[#1A1A1A] border-b border-[#333333]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="text-xs text-[#6B6B6B] ml-2">
            {framework === 'react'
              ? 'App.tsx'
              : framework === 'vue'
              ? 'App.vue'
              : 'index.html'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleReadOnly}
            className="p-1.5 rounded text-[#6B6B6B] hover:text-white hover:bg-[#333333] transition-colors"
            title={readOnly ? 'Enable editing' : 'Disable editing'}
          >
            {readOnly ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded text-[#6B6B6B] hover:text-white hover:bg-[#333333] transition-colors"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
          onChange={(value) => {
            if (onChange && value !== undefined) {
              onChange(value);
            }
          }}
          options={{
            readOnly,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            fontSize: 13,
            fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
            padding: { top: 12, bottom: 12 },
            wordWrap: 'on',
            automaticLayout: true,
            renderLineHighlight: 'none',
            overviewRulerBorder: false,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
        />
      </div>
    </div>
  );
}
