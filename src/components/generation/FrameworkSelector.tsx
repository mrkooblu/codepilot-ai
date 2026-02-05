'use client';

import { Code, FileCode, Braces, FileText } from 'lucide-react';
import type { Framework } from '@/lib/store';

interface FrameworkSelectorProps {
  selected: Framework;
  onSelect: (framework: Framework) => void;
  disabled?: boolean;
}

const FRAMEWORKS: {
  id: Framework;
  label: string;
  icon: typeof Code;
}[] = [
  { id: 'html-tailwind', label: 'HTML + Tailwind', icon: Code },
  { id: 'react', label: 'React', icon: FileCode },
  { id: 'vue', label: 'Vue', icon: Braces },
  { id: 'plain-html', label: 'HTML / CSS', icon: FileText },
];

export default function FrameworkSelector({
  selected,
  onSelect,
  disabled = false,
}: FrameworkSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {FRAMEWORKS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          disabled={disabled}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selected === id
              ? 'bg-[#1A1A1A] text-white'
              : 'bg-white text-[#6B6B6B] border border-[#E8E8E8] hover:border-[#9B9B9B] hover:text-[#1A1A1A]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
