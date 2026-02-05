'use client';

import { useCallback, useRef } from 'react';
import { Loader2, AlertCircle, Sparkles, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useGenerationStore } from '@/lib/store';
import ImageUpload from '@/components/upload/ImageUpload';
import FrameworkSelector from '@/components/generation/FrameworkSelector';
import CodeEditor from '@/components/editor/CodeEditor';
import PreviewFrame from '@/components/preview/PreviewFrame';
import ExportButtons from '@/components/generation/ExportButtons';
import QualityRating from '@/components/generation/QualityRating';
import RefinementInput from '@/components/generation/RefinementInput';
import Button from '@/components/ui/Button';

export default function GenerationPanel() {
  const {
    image,
    imageFile,
    framework,
    status,
    code,
    generationId,
    error,
    setImage,
    setFramework,
    setStatus,
    appendCode,
    setCode,
    setGenerationId,
    setError,
    reset,
  } = useGenerationStore();

  const abortRef = useRef<AbortController | null>(null);

  const startGeneration = useCallback(
    async (refinement?: string) => {
      if (!image) {
        toast.error('Please upload a screenshot first');
        return;
      }

      // Abort any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      setStatus('generating');
      setCode('');
      setError(null);

      try {
        const body: Record<string, string> = {
          image,
          framework,
        };

        if (refinement) {
          body.refinement = refinement;
          if (code) body.previousCode = code;
        }

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Generation failed (${response.status})`
          );
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        // Read SSE stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                setStatus('complete');
                continue;
              }

              try {
                const parsed = JSON.parse(data);

                if (parsed.token) {
                  appendCode(parsed.token);
                }

                if (parsed.generationId) {
                  setGenerationId(parsed.generationId);
                }

                if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (e) {
                // If it's not JSON, treat it as a raw token
                if (data && !data.startsWith('{')) {
                  appendCode(data);
                }
              }
            }
          }
        }

        // If we haven't set complete yet
        if (useGenerationStore.getState().status === 'generating') {
          setStatus('complete');
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Generation failed';
        setError(message);
        toast.error(message);
      }
    },
    [image, framework, code, setStatus, setCode, setError, appendCode, setGenerationId]
  );

  const handleGenerate = useCallback(() => {
    startGeneration();
  }, [startGeneration]);

  const handleRefinement = useCallback(
    (instruction: string) => {
      startGeneration(instruction);
    },
    [startGeneration]
  );

  const handleReset = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    reset();
  }, [reset]);

  const isGenerating = status === 'generating';
  const isComplete = status === 'complete';
  const hasCode = code.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Top section: Upload + Framework + Generate */}
      <div className="shrink-0 border-b border-[#E8E8E8] bg-white">
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1A1A1A] tracking-tight">
              Generate Code
            </h2>
            {(hasCode || image) && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start over
              </button>
            )}
          </div>

          <ImageUpload
            onImageSelect={(base64, file) => setImage(base64, file)}
            currentImage={image}
            onClear={() => setImage(null, null)}
            disabled={isGenerating}
          />

          <div className="flex items-center justify-between flex-wrap gap-3">
            <FrameworkSelector
              selected={framework}
              onSelect={setFramework}
              disabled={isGenerating}
            />

            {image && !hasCode && (
              <Button
                variant="primary"
                size="md"
                onClick={handleGenerate}
                disabled={isGenerating || !image}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Code
                  </>
                )}
              </Button>
            )}

            {hasCode && !isGenerating && (
              <Button
                variant="secondary"
                size="md"
                onClick={handleGenerate}
              >
                <RotateCcw className="w-4 h-4" />
                Regenerate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button
              onClick={handleGenerate}
              className="text-xs text-red-600 hover:text-red-800 underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Generating skeleton */}
      {isGenerating && !hasCode && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#9B9B9B] animate-spin" />
            <p className="text-sm text-[#9B9B9B]">Generating code from your screenshot...</p>
          </div>
        </div>
      )}

      {/* Code + Preview split */}
      {hasCode && (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Code panel */}
            <div className="min-h-0 flex flex-col border-r border-[#E8E8E8]">
              <div className="flex-1 min-h-0 p-3">
                <CodeEditor
                  code={code}
                  framework={framework}
                  onChange={(value) => setCode(value)}
                />
              </div>
            </div>

            {/* Preview panel */}
            <div className="min-h-0 flex flex-col">
              <div className="flex-1 min-h-0 p-3">
                <PreviewFrame code={code} framework={framework} />
              </div>
            </div>
          </div>

          {/* Bottom bar: Export + Rating + Refinement */}
          <div className="shrink-0 border-t border-[#E8E8E8] bg-white px-5 py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4 flex-wrap">
                <ExportButtons code={code} framework={framework} />
                {isComplete && (
                  <QualityRating generationId={generationId} />
                )}
              </div>
              {isGenerating && (
                <div className="flex items-center gap-2 text-xs text-[#9B9B9B]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Streaming...
                </div>
              )}
            </div>
            {isComplete && (
              <div className="mt-3">
                <RefinementInput
                  onSubmit={handleRefinement}
                  disabled={isGenerating}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Idle state -- no image, no code */}
      {!image && !hasCode && status === 'idle' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <p className="text-sm text-[#9B9B9B]">
              Upload a screenshot to get started. The AI will analyze it and generate clean, responsive code in your chosen framework.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
