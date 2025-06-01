'use client'; // Necessário para useEffect, useState, useRouter e localStorage

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ExerciseCard from '@/app/components/exercise/ExerciseCard'; // Seu componente de card
// import type { Metadata } from 'next'; // Removido se não estiver usando para metadados dinâmicos aqui

// Interface para o tipo de usuário que esperamos do localStorage
interface CurrentUser {
  id: number;
  name: string;
}

// Interface para o tipo de quiz que esperamos da API (baseado no QuizInfoDTO)
interface ApiQuiz {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  subjectId?: number; 
  subjectName?: string; 
}

export default function ExercisesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Inicia como true para mostrar "Verificando usuário..."
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      router.replace('/login'); 
      return;
    }
    
    try {
        const parsedUser: CurrentUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);

        // Só busca quizzes se o usuário estiver "logado" e identificado
        const fetchQuizzes = async () => {
          setIsLoading(true); // Define isLoading como true antes de buscar
          try {
            const response = await fetch('http://localhost:8080/api/quizzes/all');
            if (!response.ok) {
              throw new Error(`Erro ao buscar quizzes: ${response.statusText}`);
            }
            const data: ApiQuiz[] = await response.json();
            setQuizzes(data);
            setError(null); // Limpa erros anteriores se a busca for bem-sucedida
          } catch (err: any) {
            setError(err.message || 'Não foi possível carregar os exercícios.');
            console.error("Erro ao buscar quizzes:", err);
            setQuizzes([]); // Limpa quizzes em caso de erro para não mostrar dados antigos
          } finally {
            setIsLoading(false); // Define isLoading como false após a tentativa de busca
          }
        };
        fetchQuizzes();

    } catch (e) {
        // Erro ao fazer parse do storedUser, pode ser inválido
        console.error("Erro ao fazer parse do usuário armazenado:", e);
        localStorage.removeItem('currentUser'); // Limpa o item inválido
        router.replace('/login');
        // setIsLoading(false) é chamado no finally do fetchQuizzes,
        // mas se o parse do usuário falhar antes, isLoading pode não ser resetado.
        // No entanto, o redirect deve acontecer. Se quiser um loader aqui, precisaria de mais lógica.
    }

  }, [router]);

  // Estado de carregamento inicial enquanto verifica o usuário
  // e antes que o currentUser seja definido pelo useEffect.
  // Ou se o usuário não for encontrado e o redirect ainda não ocorreu.
  if (!currentUser) { 
    // Este loader será mostrado brevemente antes do redirect ou antes do currentUser ser setado.
    // Se o redirect para /login acontecer, esta UI não será mais relevante.
    // O isLoading no return principal abaixo cobre o carregamento dos quizzes.
    return <div className="flex min-h-screen items-center justify-center bg-[#26244a] text-white">Verificando autenticação...</div>;
  }

  return (
    <section className="bg-[#26244a] px-4 pb-16 pt-10 text-[#d9d8f9]">
      <header className="mx-auto max-w-4xl">
        {/* Removido o div com flex justify-between e o botão Sair */}
        <div> 
            <h1 className="text-4xl font-extrabold">Exercícios</h1>
            <hr className="my-2 border-[#7a799c]" />
            <p className="text-sm leading-relaxed lg:text-base">
              Olá, <span className="font-semibold">{currentUser.name}</span>! Escolha um exercício e comece seu aprendizado.
            </p>
        </div>
      </header>

      <div className="mx-auto mt-8 flex max-w-4xl flex-col gap-6">
        {isLoading && ( // Mostra carregando apenas se isLoading for true
          <p className="text-center">Carregando exercícios...</p>
        )}
        {!isLoading && error && (
          <p className="text-center text-red-400">{error}</p>
        )}
        {!isLoading && !error && quizzes.length === 0 && (
          <p className="text-center">Nenhum exercício disponível no momento.</p>
        )}
        {!isLoading && !error && quizzes.map((quiz) => (
          <ExerciseCard
            key={quiz.id}
            title={quiz.name} 
            summary={quiz.description} 
            href={`/quizzes/${quiz.id}`} 
          />
        ))}
      </div>
    </section>
  );
}