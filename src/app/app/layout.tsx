import Link from 'next/link';
import { Toaster } from 'sonner';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="flex flex-col h-screen">
        {/* Top nav */}
        <header className="shrink-0 h-14 border-b border-[#E8E8E8] bg-white">
          <div className="flex items-center justify-between h-full px-5">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-lg font-bold text-[#1A1A1A] tracking-tight"
              >
                CodePilot
              </Link>
              <nav className="hidden sm:flex items-center gap-4">
                <Link
                  href="/app"
                  className="text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
                >
                  Generate
                </Link>
                <Link
                  href="/app/history"
                  className="text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
                >
                  History
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {/* Placeholder for Clerk UserButton */}
              <div className="w-8 h-8 rounded-full bg-[#F8F8FA] border border-[#E8E8E8] flex items-center justify-center">
                <span className="text-xs font-medium text-[#9B9B9B]">U</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 min-h-0 bg-[#F8F8FA]">{children}</main>
      </div>
    </>
  );
}
