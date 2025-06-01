// app/login/page.tsx
'use client'; // Indicar que este é um Client Component, pois usaremos estado e eventos

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; // Para redirecionamento

export default function LoginPage() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name.trim()) {
      setError('Por favor, insira seu nome.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
        // Se o backend fosse setar um cookie HttpOnly e você precisasse enviar credenciais
        // (como outros cookies de sessão) para que ele o fizesse, você adicionaria:
        // credentials: 'include', 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erro ao criar usuário: ${response.statusText}`);
      }

      const createdUser = await response.json();

      // 1. Armazenar no localStorage (como você já faz, útil para a UI)
      localStorage.setItem('currentUser', JSON.stringify({ id: createdUser.id, name: createdUser.name }));

      // 2. SETAR O COOKIE PARA O MIDDLEWARE LER (cookie regular)
      // Este é um cookie simples para fins de teste do middleware.
      // Ele expira em 1 dia (86400 segundos). Path=/ significa que é acessível em todo o site.
      // Em um cenário real, o backend definiria um cookie HttpOnly mais seguro.
      const cookieName = 'sessionToken'; // Deve ser o mesmo que AUTH_COOKIE_NAME no middleware.ts
      const cookieValue = createdUser.id.toString(); // Pode ser o ID do usuário, um token simples, etc.
      const daysToExpire = 1;
      const expires = new Date(Date.now() + daysToExpire * 86400 * 1000).toUTCString();
      document.cookie = `${cookieName}=${cookieValue}; expires=${expires}; path=/; SameSite=Lax`;
      // Nota: Se seu backend e frontend estão em domínios diferentes (ex: localhost:8080 e localhost:3000),
      // o backend ainda precisaria ter CORS configurado para `Allow-Credentials: true`
      // e o frontend `fetch` precisaria de `credentials: 'include'` para que cookies
      // enviados pelo backend fossem realmente salvos e enviados de volta pelo navegador.
      // No entanto, como o frontend está setando este cookie, ele será no domínio do frontend.

      console.log(`Cookie '${cookieName}' setado com valor '${cookieValue}'`);

      // Redirecionar para a página de exercícios
      router.push('/quizzes'); // Ajuste a rota se necessário

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
      console.error("Erro no login:", err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <section className="flex min-h-screen items-center justify-center bg-[#26244a] px-4 text-[#d9d8f9]">
      <div className="w-full max-w-md rounded-lg bg-[#3b3961] p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-extrabold">
          Bem-vindo(a)!
        </h1>
        <p className="mb-6 text-center text-sm text-[#c0bfde]">
          Para começar, por favor, insira seu nome abaixo.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Seu Nome:
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-[#585680] bg-[#2e2c54] px-3 py-2 text-sm placeholder-[#7a799c] focus:border-pink-500 focus:ring-pink-500"
              placeholder="Digite seu nome aqui"
              disabled={isLoading}
            />
          </div>
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-[#26244a] disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </section>
  );
}