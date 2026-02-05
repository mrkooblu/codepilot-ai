'use client';

import { useEffect, useRef, useState } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import type { Framework } from '@/lib/store';

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_WIDTHS: Record<ViewportSize, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 375,
};

const VIEWPORT_ICONS: Record<ViewportSize, typeof Monitor> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

interface PreviewFrameProps {
  code: string;
  framework: Framework;
}

export default function PreviewFrame({ code, framework }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  useEffect(() => {
    if (!iframeRef.current || !code) return;

    const html =
      framework === 'html-tailwind' || framework === 'plain-html'
        ? code
        : wrapInHTML(code, framework);

    iframeRef.current.srcdoc = html;
  }, [code, framework]);

  return (
    <div className="flex flex-col h-full border border-[#E8E8E8] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[#F8F8FA] border-b border-[#E8E8E8]">
        <span className="text-xs font-medium text-[#9B9B9B] uppercase tracking-wider">
          Preview
        </span>
        <div className="flex items-center gap-1">
          {(Object.keys(VIEWPORT_WIDTHS) as ViewportSize[]).map((size) => {
            const Icon = VIEWPORT_ICONS[size];
            return (
              <button
                key={size}
                onClick={() => setViewport(size)}
                className={`p-1.5 rounded transition-colors ${
                  viewport === size
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#9B9B9B] hover:text-[#1A1A1A] hover:bg-[#E8E8E8]'
                }`}
                title={size.charAt(0).toUpperCase() + size.slice(1)}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-[#F0F0F0] flex justify-center p-4">
        <div
          style={{ width: VIEWPORT_WIDTHS[viewport], maxWidth: '100%' }}
          className="bg-white shadow-lg transition-all duration-300 h-fit rounded overflow-hidden"
        >
          <iframe
            ref={iframeRef}
            sandbox="allow-scripts"
            className="w-full border-0"
            style={{ minHeight: '600px' }}
            title="Code Preview"
          />
        </div>
      </div>
    </div>
  );
}

function wrapInHTML(code: string, framework: string): string {
  if (framework === 'react') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script src="https://unpkg.com/react@19/umd/react.production.min.js"><\/script>
  <script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(typeof App !== 'undefined' ? App : () => null));
  <\/script>
</body>
</html>`;
  }

  if (framework === 'vue') {
    const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
    const templateContent = templateMatch?.[1] || '';
    const scriptContent = code.replace(/<script setup.*?>[\s\S]*?<\/script>/, '');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"><\/script>
</head>
<body>
  <div id="app"></div>
  <script>
    ${scriptContent}
    const { createApp } = Vue;
    const template = \`${templateContent}\`;
    createApp({ template }).mount('#app');
  <\/script>
</body>
</html>`;
  }

  return code;
}
