import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/layout/Providers";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <Providers>
      <div className="flex min-h-full flex-col bg-slate-50">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </Providers>
  );
}
