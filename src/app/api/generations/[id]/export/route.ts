import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGeneration } from '@/lib/db/generations';

/** File extension mapping for each framework. */
const FRAMEWORK_EXTENSIONS: Record<string, string> = {
  'html-tailwind': '.html',
  'plain-html': '.html',
  react: '.tsx',
  vue: '.vue',
};

/** MIME type for download responses. */
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.tsx': 'text/plain',
  '.vue': 'text/plain',
};

/**
 * POST /api/generations/[id]/export
 *
 * Exports a generation as a downloadable file or ZIP archive.
 *
 * Request body: `{ format: 'file' | 'zip' }`
 *
 * - `file`: Returns the raw code as a downloadable file with the correct extension.
 * - `zip`: Returns a ZIP containing the code file plus scaffolding files
 *   (package.json, tailwind.config) for React and Vue frameworks.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  let body: { format?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const format = body.format ?? 'file';

  if (format !== 'file' && format !== 'zip') {
    return Response.json(
      { error: 'Format must be "file" or "zip"' },
      { status: 400 }
    );
  }

  // Fetch the generation
  const generation = await getGeneration(id, userId);
  if (!generation) {
    return Response.json({ error: 'Generation not found' }, { status: 404 });
  }

  if (!generation.output_code) {
    return Response.json(
      { error: 'Generation has no code to export' },
      { status: 400 }
    );
  }

  const ext = FRAMEWORK_EXTENSIONS[generation.input_framework] ?? '.html';
  const filename = `codepilot-export${ext}`;
  const mime = MIME_TYPES[ext] ?? 'text/plain';

  // --- Single file download ---
  if (format === 'file') {
    return new Response(generation.output_code, {
      headers: {
        'Content-Type': mime,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }

  // --- ZIP download ---
  // Build a ZIP manually using basic deflate-store approach (no external lib).
  // This creates a valid ZIP with uncompressed entries.
  const files: Array<{ name: string; content: string }> = [];

  // Main code file
  const mainFile =
    generation.input_framework === 'react'
      ? 'src/App.tsx'
      : generation.input_framework === 'vue'
        ? 'src/App.vue'
        : 'index.html';

  files.push({ name: mainFile, content: generation.output_code });

  // Add scaffolding for React / Vue
  if (
    generation.input_framework === 'react' ||
    generation.input_framework === 'vue'
  ) {
    files.push({
      name: 'package.json',
      content: buildPackageJson(generation.input_framework),
    });

    files.push({
      name: 'tailwind.config.js',
      content: buildTailwindConfig(),
    });

    if (generation.input_framework === 'react') {
      files.push({
        name: 'tsconfig.json',
        content: buildTsConfig(),
      });
    }
  }

  // Create ZIP buffer
  const zipBuffer = createZipBuffer(files);

  return new Response(zipBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="codepilot-export.zip"`,
    },
  });
}

// ---------------------------------------------------------------------------
// ZIP Helpers — minimal ZIP file builder (store-only, no compression deps)
// ---------------------------------------------------------------------------

interface ZipEntry {
  name: string;
  content: string;
}

/**
 * Creates a valid ZIP file buffer from an array of text files.
 * Uses the STORE method (no compression) to avoid needing zlib.
 */
function createZipBuffer(entries: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const localHeaders: Uint8Array[] = [];
  const centralHeaders: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const contentBytes = encoder.encode(entry.content);
    const crc = crc32(contentBytes);

    // Local file header (30 bytes + name + content)
    const local = new Uint8Array(30 + nameBytes.length + contentBytes.length);
    const localView = new DataView(local.buffer);

    localView.setUint32(0, 0x04034b50, true); // signature
    localView.setUint16(4, 20, true); // version needed
    localView.setUint16(6, 0, true); // flags
    localView.setUint16(8, 0, true); // compression (store)
    localView.setUint16(10, 0, true); // mod time
    localView.setUint16(12, 0, true); // mod date
    localView.setUint32(14, crc, true); // crc32
    localView.setUint32(18, contentBytes.length, true); // compressed size
    localView.setUint32(22, contentBytes.length, true); // uncompressed size
    localView.setUint16(26, nameBytes.length, true); // name length
    localView.setUint16(28, 0, true); // extra length

    local.set(nameBytes, 30);
    local.set(contentBytes, 30 + nameBytes.length);
    localHeaders.push(local);

    // Central directory header (46 bytes + name)
    const central = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(central.buffer);

    centralView.setUint32(0, 0x02014b50, true); // signature
    centralView.setUint16(4, 20, true); // version made by
    centralView.setUint16(6, 20, true); // version needed
    centralView.setUint16(8, 0, true); // flags
    centralView.setUint16(10, 0, true); // compression
    centralView.setUint16(12, 0, true); // mod time
    centralView.setUint16(14, 0, true); // mod date
    centralView.setUint32(16, crc, true); // crc32
    centralView.setUint32(20, contentBytes.length, true); // compressed size
    centralView.setUint32(24, contentBytes.length, true); // uncompressed size
    centralView.setUint16(28, nameBytes.length, true); // name length
    centralView.setUint16(30, 0, true); // extra length
    centralView.setUint16(32, 0, true); // comment length
    centralView.setUint16(34, 0, true); // disk number start
    centralView.setUint16(36, 0, true); // internal attrs
    centralView.setUint32(38, 0, true); // external attrs
    centralView.setUint32(42, offset, true); // local header offset

    central.set(nameBytes, 46);
    centralHeaders.push(central);

    offset += local.length;
  }

  // End of central directory record (22 bytes)
  const centralDirSize = centralHeaders.reduce((s, c) => s + c.length, 0);
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);

  eocdView.setUint32(0, 0x06054b50, true); // signature
  eocdView.setUint16(4, 0, true); // disk number
  eocdView.setUint16(6, 0, true); // central dir disk
  eocdView.setUint16(8, entries.length, true); // entries on disk
  eocdView.setUint16(10, entries.length, true); // total entries
  eocdView.setUint32(12, centralDirSize, true); // central dir size
  eocdView.setUint32(16, offset, true); // central dir offset
  eocdView.setUint16(20, 0, true); // comment length

  // Concatenate everything
  const totalSize =
    localHeaders.reduce((s, h) => s + h.length, 0) +
    centralDirSize +
    eocd.length;

  const result = new Uint8Array(totalSize);
  let pos = 0;

  for (const h of localHeaders) {
    result.set(h, pos);
    pos += h.length;
  }
  for (const h of centralHeaders) {
    result.set(h, pos);
    pos += h.length;
  }
  result.set(eocd, pos);

  return result;
}

/** Simple CRC-32 implementation. */
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ---------------------------------------------------------------------------
// Scaffold file builders
// ---------------------------------------------------------------------------

function buildPackageJson(framework: string): string {
  if (framework === 'react') {
    return JSON.stringify(
      {
        name: 'codepilot-export',
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'vite',
          build: 'tsc && vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: '^19.0.0',
          'react-dom': '^19.0.0',
        },
        devDependencies: {
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          '@vitejs/plugin-react': '^4.0.0',
          autoprefixer: '^10.0.0',
          postcss: '^8.0.0',
          tailwindcss: '^4.0.0',
          typescript: '^5.0.0',
          vite: '^6.0.0',
        },
      },
      null,
      2
    );
  }

  // Vue
  return JSON.stringify(
    {
      name: 'codepilot-export',
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'vite',
        build: 'vue-tsc && vite build',
        preview: 'vite preview',
      },
      dependencies: {
        vue: '^3.5.0',
      },
      devDependencies: {
        '@vitejs/plugin-vue': '^5.0.0',
        autoprefixer: '^10.0.0',
        postcss: '^8.0.0',
        tailwindcss: '^4.0.0',
        typescript: '^5.0.0',
        vite: '^6.0.0',
        'vue-tsc': '^2.0.0',
      },
    },
    null,
    2
  );
}

function buildTailwindConfig(): string {
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;
}

function buildTsConfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
      },
      include: ['src'],
    },
    null,
    2
  );
}
