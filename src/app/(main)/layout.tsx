import Header from '@/app/compoents/Header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl p-4">{children}</main>
    </>
  );
}