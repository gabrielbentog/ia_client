'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ExerciseCard from '@/app/components/exercise/ExerciseCard';

interface CurrentUser {
  id: number;
  name: string;
}

interface ApiQuiz {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  subjectId?: number;
  subjectName?: string;
}

interface PaginatedQuizzesResponse {
  content: ApiQuiz[];
  totalPages: number;
  totalElements: number;
  number: number; // Página atual (base 0)
  size: number;
}

export default function ExercisesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      router.replace('/login');
      return;
    }

    try {
      const parsedUser: CurrentUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
    } catch (e) {
      console.error("Erro ao fazer parse do usuário armazenado:", e);
      localStorage.removeItem('currentUser');
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8080/api/quizzes?page=${currentPage}&size=${itemsPerPage}`
        );
        if (!response.ok) {
          throw new Error(`Erro ao buscar quizzes: ${response.statusText}`);
        }
        const data: PaginatedQuizzesResponse = await response.json();
        setQuizzes(data.content);
        setTotalPages(data.totalPages);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Não foi possível carregar os exercícios.');
        console.error("Erro ao buscar quizzes:", err);
        setQuizzes([]);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, [currentUser, currentPage, itemsPerPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#26244a] text-white">
        Verificando autenticação...
      </div>
    );
  }

  return (
    <section className="bg-[#26244a] px-4 pb-16 pt-10 text-[#d9d8f9] min-h-screen">
      <header className="mx-auto max-w-4xl">
        <div>
          <h1 className="text-4xl font-extrabold">Exercícios</h1>
          <hr className="my-2 border-[#7a799c]" />
          <p className="text-sm leading-relaxed lg:text-base">
            Olá, <span className="font-semibold">{currentUser.name}</span>! Escolha um exercício e comece seu aprendizado.
          </p>
        </div>
      </header>

      <div className="mx-auto mt-8 flex max-w-4xl flex-col gap-6 transition-opacity duration-300 ease-in-out">
        {isLoading ? (
          <p className="text-center">Carregando exercícios...</p>
        ) : error ? (
          <p className="text-center text-red-400">{error}</p>
        ) : quizzes.length === 0 ? (
          <p className="text-center">Nenhum exercício disponível no momento.</p>
        ) : (
          quizzes.map((quiz) => (
            <ExerciseCard
              key={quiz.id}
              title={quiz.name}
              summary={quiz.description}
              href={`/quizzes/${quiz.id}`}
              difficulty={quiz.difficulty}
            />
          ))
        )}
      </div>

      {!isLoading && !error && quizzes.length > 0 && totalPages > 1 && (
        <div className="mx-auto mt-8 flex max-w-4xl justify-center gap-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="rounded bg-[#4a477a] px-4 py-2 text-white hover:bg-[#5f5c9d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="flex items-center">
            Página {currentPage + 1} de {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="rounded bg-[#4a477a] px-4 py-2 text-white hover:bg-[#5f5c9d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </section>
  );
}
