'use client';

import { useCallback, useState } from 'react';
import { Copy, Download, Archive, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Framework } from '@/lib/store';

interface ExportButtonsProps {
  code: string;
  framework: Framework;
}

const FILE_EXTENSIONS: Record<Framework, string> = {
  'html-tailwind': '.html',
  'plain-html': '.html',
  react: '.tsx',
  vue: '.vue',
};

const FILE_NAMES: Record<Framework, string> = {
  'html-tailwind': 'index.html',
  'plain-html': 'index.html',
  react: 'App.tsx',
  vue: 'App.vue',
};

export default function ExportButtons({ code, framework }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);

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

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = FILE_NAMES[framework];
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${FILE_NAMES[framework]}`);
  }, [code, framework]);

  const handleDownloadZip = useCallback(async () => {
    // For HTML frameworks, just download the file
    if (framework === 'html-tailwind' || framework === 'plain-html') {
      handleDownload();
      return;
    }

    // For React/Vue, create a simple project structure
    // Since we don't have JSZip as a dependency, we'll trigger a POST to an API
    // For now, download the single file with a toast about the project setup
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = FILE_NAMES[framework];
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${FILE_NAMES[framework]}`, {
      description:
        framework === 'react'
          ? 'Create a React project with: npx create-vite@latest my-app --template react-ts'
          : 'Create a Vue project with: npm create vue@latest',
    });
  }, [code, framework, handleDownload]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-[#E8E8E8] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#9B9B9B] transition-colors"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
        Copy Code
      </button>
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-[#E8E8E8] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#9B9B9B] transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Download{FILE_EXTENSIONS[framework]}
      </button>
      {(framework === 'react' || framework === 'vue') && (
        <button
          onClick={handleDownloadZip}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-[#E8E8E8] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#9B9B9B] transition-colors"
        >
          <Archive className="w-3.5 h-3.5" />
          Download ZIP
        </button>
      )}
    </div>
  );
}
