'use client';

import { useState, useCallback } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';

interface QualityRatingProps {
  generationId: string | null;
}

type Rating = 'up' | 'down' | null;

export default function QualityRating({ generationId }: QualityRatingProps) {
  const [rating, setRating] = useState<Rating>(null);

  const handleRate = useCallback(
    async (value: 'up' | 'down') => {
      if (!generationId) return;

      setRating(value);

      try {
        await fetch(`/api/generations/${generationId}/rate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: value === 'up' ? 1 : -1 }),
        });
        toast.success('Thanks for your feedback!');
      } catch {
        // Don't revert the UI state -- feedback is low-stakes
        toast.error('Failed to save rating');
      }
    },
    [generationId]
  );

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#9B9B9B] font-medium">How did we do?</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleRate('up')}
          disabled={rating !== null}
          className={`p-1.5 rounded transition-colors ${
            rating === 'up'
              ? 'bg-emerald-50 text-emerald-600'
              : rating === null
              ? 'text-[#9B9B9B] hover:text-emerald-600 hover:bg-emerald-50'
              : 'text-[#E8E8E8] cursor-default'
          }`}
          title="Good output"
        >
          <ThumbsUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleRate('down')}
          disabled={rating !== null}
          className={`p-1.5 rounded transition-colors ${
            rating === 'down'
              ? 'bg-red-50 text-red-500'
              : rating === null
              ? 'text-[#9B9B9B] hover:text-red-500 hover:bg-red-50'
              : 'text-[#E8E8E8] cursor-default'
          }`}
          title="Bad output"
        >
          <ThumbsDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
