'use client';

import GenerationHistory from '@/components/generation/GenerationHistory';

export default function HistoryPage() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
          Your Generations
        </h1>
        <p className="text-sm text-[#9B9B9B] mt-1">
          Browse and revisit your past screenshot-to-code conversions.
        </p>
      </div>
      <GenerationHistory />
    </div>
  );
}
