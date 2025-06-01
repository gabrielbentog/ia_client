// components/Header.tsx
'use client'; // Necessário para interagir com localStorage, cookies e usar hooks

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; // usePathname para re-renderizar no logout
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface CurrentUser {
  id: number;
  name: string;
}

const AUTH_COOKIE_NAME = 'sessionToken'; // Mesmo nome usado no middleware e LoginPage

export default function Header() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const router = useRouter();
  const pathname = usePathname(); // Hook para detectar mudanças de rota

  useEffect(() => {
    // Tenta carregar o usuário do localStorage na montagem e em mudanças de rota
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Erro ao parsear usuário do localStorage no Header:", e);
        localStorage.removeItem('currentUser'); // Limpa se estiver inválido
        // Também remove o cookie de autenticação se o localStorage estiver corrompido
        document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null); // Garante que currentUser seja null se não houver nada no localStorage
    }
  }, [pathname]); // Re-executa quando a rota muda, para atualizar o estado do header

  const handleLogout = () => {
    // 1. Limpar o localStorage
    localStorage.removeItem('currentUser');

    // 2. Limpar o cookie de autenticação (sessionToken)
    // Define o cookie com uma data de expiração no passado para removê-lo
    document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
    
    // 3. Resetar o estado local do usuário
    setCurrentUser(null);

    // 4. Redirecionar para a página de login
    // Usar router.replace para não adicionar a página atual ao histórico após o logout
    router.replace('/login'); 
  };

  return (
    <header className="bg-[#e9e8fd] text-[#110b3e]">
      <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 sm:px-8 sm:py-4"> {/* Ajustado padding para mobile */}
        {/* --- logo --- */}
        <Link href={currentUser ? "/quizzes" : "/"} aria-label="Página Inicial"> {/* Leva para quizzes se logado, senão para home */}
            <img src="/logo.svg" alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10" /> {/* Tamanho responsivo */}
        </Link>
        
        {/* --- título central --- */}
        <nav className="justify-self-center">
          <Link href={currentUser ? "/quizzes" : "/"} className="text-xl font-bold leading-none tracking-normal sm:text-[28px]">
            {currentUser ? 'Exercícios' : 'Home'} {/* Título dinâmico */}
          </Link>
        </nav>

        {/* --- usuário / sair --- */}
        {currentUser ? (
          <div className="flex items-center gap-2 sm:gap-3 justify-self-end">
            <span className="hidden sm:block text-sm font-medium"> {/* Nome do usuário */}
              {currentUser.name}
            </span>
            <UserCircleIcon className="h-7 w-7 sm:h-8 sm:w-8" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded border-2 border-current px-2 py-1 text-xs font-medium transition hover:bg-[#dcd9ff] sm:px-3 sm:text-sm"
              aria-label="Sair"
            >
              <span className="hidden sm:inline">Sair</span> {/* Texto "Sair" opcional em telas pequenas */}
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          // Opcional: Mostrar um botão de Login se o usuário não estiver logado e não estiver na página de login
          pathname !== '/login' && (
            <div className="justify-self-end">
              <Link
                href="/login"
                className="flex items-center gap-1 rounded border-2 border-transparent px-3 py-1 text-sm font-medium text-[#110b3e] transition hover:border-current hover:bg-[#dcd9ff]"
              >
                <UserCircleIcon className="h-5 w-5" /> Entrar
              </Link>
            </div>
          )
        )}
      </div>
    </header>
  );
}