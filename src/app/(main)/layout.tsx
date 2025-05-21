// app/(main)/layout.tsx
import Header from '@/app/components/Header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    // root flex-column que ocupa 100 vh
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* área central ocupa todo o resto da tela  */}
      <main className="flex flex-1 justify-center overflow-y-auto bg-[#26244a]">
        {/* conteúdo limitado, mas só ele – o fundo preenche 100 % */}
        <div className="w-full max-w-4xl px-4 pb-16 pt-10">{children}</div>
      </main>
    </div>
  );
}
