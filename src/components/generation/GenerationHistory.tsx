'use client';

import { useEffect, useState } from 'react';
import { Clock, Image as ImageIcon } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import type { Framework } from '@/lib/store';

interface Generation {
  id: string;
  input_image_url: string | null;
  input_framework: Framework;
  output_code: string | null;
  created_at: string;
}

const FRAMEWORK_LABELS: Record<Framework, string> = {
  'html-tailwind': 'HTML + Tailwind',
  react: 'React',
  vue: 'Vue',
  'plain-html': 'HTML / CSS',
};

interface GenerationHistoryProps {
  onSelect?: (generation: Generation) => void;
}

export default function GenerationHistory({ onSelect }: GenerationHistoryProps) {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGenerations() {
      try {
        const response = await fetch('/api/generations');
        if (!response.ok) {
          throw new Error('Failed to fetch generations');
        }
        const data = await response.json();
        setGenerations(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchGenerations();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#E8E8E8] rounded-lg overflow-hidden animate-pulse"
          >
            <div className="aspect-video bg-[#F8F8FA]" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-20 bg-[#F8F8FA] rounded" />
              <div className="h-3 w-32 bg-[#F8F8FA] rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <p className="text-sm text-red-500">{error}</p>
      </Card>
    );
  }

  if (generations.length === 0) {
    return (
      <Card className="text-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-[#F8F8FA]">
            <ImageIcon className="w-6 h-6 text-[#9B9B9B]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1A1A1A]">
              No generations yet
            </p>
            <p className="text-sm text-[#9B9B9B] mt-1">
              Drop a screenshot to get started.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {generations.map((gen) => (
        <button
          key={gen.id}
          onClick={() => onSelect?.(gen)}
          className="bg-white border border-[#E8E8E8] rounded-lg overflow-hidden text-left hover:border-[#9B9B9B] transition-colors group"
        >
          <div className="aspect-video bg-[#F8F8FA] flex items-center justify-center overflow-hidden">
            {gen.input_image_url ? (
              <img
                src={gen.input_image_url}
                alt="Screenshot"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-[#E8E8E8]" />
            )}
          </div>
          <div className="p-3 flex items-center justify-between">
            <Badge variant="framework">{FRAMEWORK_LABELS[gen.input_framework]}</Badge>
            <span className="flex items-center gap-1 text-xs text-[#9B9B9B]">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(gen.created_at)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
