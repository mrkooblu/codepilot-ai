import { create } from 'zustand';

export type Framework = 'html-tailwind' | 'react' | 'vue' | 'plain-html';
export type GenerationStatus = 'idle' | 'uploading' | 'generating' | 'complete' | 'error';

interface GenerationState {
  // Upload
  image: string | null;
  imageFile: File | null;
  framework: Framework;

  // Generation
  status: GenerationStatus;
  code: string;
  generationId: string | null;
  error: string | null;

  // Actions
  setImage: (image: string | null, file: File | null) => void;
  setFramework: (framework: Framework) => void;
  setStatus: (status: GenerationStatus) => void;
  appendCode: (token: string) => void;
  setCode: (code: string) => void;
  setGenerationId: (id: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  image: null,
  imageFile: null,
  framework: 'html-tailwind' as Framework,
  status: 'idle' as GenerationStatus,
  code: '',
  generationId: null,
  error: null,
};

export const useGenerationStore = create<GenerationState>((set) => ({
  ...initialState,

  setImage: (image, file) => set({ image, imageFile: file }),

  setFramework: (framework) => set({ framework }),

  setStatus: (status) => set({ status }),

  appendCode: (token) => set((state) => ({ code: state.code + token })),

  setCode: (code) => set({ code }),

  setGenerationId: (id) => set({ generationId: id }),

  setError: (error) => set({ error, status: error ? 'error' : 'idle' }),

  reset: () => set(initialState),
}));
