'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { SendHorizontal } from 'lucide-react';

interface RefinementInputProps {
  onSubmit: (instruction: string) => void;
  disabled?: boolean;
}

export default function RefinementInput({
  onSubmit,
  disabled = false,
}: RefinementInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (!trimmed || disabled) return;
      onSubmit(trimmed);
      setValue('');
    },
    [value, disabled, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex-1 relative">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Make the header bigger, change the blue to green..."
          disabled={disabled}
          className="w-full px-4 py-2.5 text-sm bg-white border border-[#E8E8E8] rounded-lg text-[#1A1A1A] placeholder:text-[#9B9B9B] focus:outline-none focus:border-[#1A1A1A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="p-2.5 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Send refinement"
      >
        <SendHorizontal className="w-4 h-4" />
      </button>
    </form>
  );
}
