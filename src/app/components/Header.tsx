// components/Header.tsx
import Link from 'next/link';
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function Header() {
  return (
    <header className="bg-[#e9e8fd] text-[#110b3e]">
      <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-8 py-4">
        {/* --- logo --- */}
        <Link
          href="/"
        >
            <img src="/logo.svg" alt="Logo" className="h-10 w-10" />
        </Link>
        {/* --- título central --- */}
        <nav className="justify-self-center">
          <Link href="/" className="font-bold text-[28px] leading-none tracking-normal">
            Home
          </Link>
        </nav>

        {/* --- usuário / sair --- */}
        <div className="flex items-center gap-3 justify-self-end">
          <span className="hidden sm:block text-sm">Usuário</span>
          <UserCircleIcon className="h-8 w-8" />
          <button className="flex items-center gap-1 rounded border-2 border-current px-3 py-1 text-sm font-medium transition hover:bg-[#dcd9ff]">
            Sair
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
