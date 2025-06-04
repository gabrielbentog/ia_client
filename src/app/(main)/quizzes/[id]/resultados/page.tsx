// app/quiz/[id]/resultados/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HandThumbUpIcon,
  XMarkIcon,
  ArrowPathIcon,
  HomeIcon,
} from '@heroicons/react/24/solid';
import ExerciseCard from '@/app/components/exercise/ExerciseCard'; // Certifique-se que o caminho está correto
import Divider from '@/app/components/Divider';

// ... (suas interfaces permanecem as mesmas: CurrentUser, AnswerFeedbackApiDTO, AttemptResultApiDTO, QuizInfoApiDTO, RecommendationApiDTO) ...
interface CurrentUser {
  id: number;
  name: string;
}

interface AnswerFeedbackApiDTO {
  questionId: number;
  questionBody: string;
  selectedAlternativeId: number | null;
  selectedAlternativeBody: string | null;
  correct: boolean;
  correctAlternativeId: number;
  correctAlternativeBody: string;
  justification: string;
}

interface AttemptResultApiDTO {
  attemptId: number;
  quizId: number;
  quizName: string;
  userId: number;
  score: number;
  startTime: string;
  endTime: string;
  status: string;
  answerFeedbacks: AnswerFeedbackApiDTO[];
}

interface QuizInfoApiDTO { // Esta interface já tem 'difficulty'
  id: number;
  name: string;
  description: string;
  difficulty: number; // Crucial para a tag
  subjectId?: number;
  subjectName?: string;
}

interface RecommendationApiDTO {
    userId: number;
    recommendedQuizzes: QuizInfoApiDTO[]; // Array de QuizInfoApiDTO
    message: string;
}


export default function QuizResultPage() {
  const router = useRouter();
  const { id: quizIdFromRoute } = useParams();
  const searchParams = useSearchParams();
  const attemptIdParam = searchParams.get('attemptId');

  const [attemptResult, setAttemptResult] = useState<AttemptResultApiDTO | null>(null);
  const [recommendations, setRecommendations] = useState<QuizInfoApiDTO[]>([]); // Estado para os quizzes recomendados
  const [recommendationMessage, setRecommendationMessage] = useState<string>('');

  const [isLoadingResult, setIsLoadingResult] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // ... (useEffect para currentUser e fetchAttemptResults permanecem os mesmos) ...
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        try {
            setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Erro ao parsear usuário para buscar recomendações:", e);
        }
    } else {
        console.warn("Usuário não encontrado no localStorage para buscar recomendações personalizadas.");
        setIsLoadingRecommendations(false);
    }
  }, []);

  useEffect(() => {
    if (!attemptIdParam) {
      setError('ID da tentativa não encontrado na URL.');
      setIsLoadingResult(false);
      setIsLoadingRecommendations(false);
      return;
    }
    const attemptId = parseInt(attemptIdParam, 10);
    if (isNaN(attemptId)) {
        setError('ID da tentativa inválido na URL.');
        setIsLoadingResult(false);
        setIsLoadingRecommendations(false);
        return;
    }

    const fetchAttemptResults = async () => {
      setIsLoadingResult(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8080/api/attempts/${attemptId}/result`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Erro ao ler corpo da resposta."}) );
          throw new Error(errorData?.message || `Erro ao buscar resultado da tentativa: ${response.statusText}`);
        }
        const data: AttemptResultApiDTO = await response.json();
        setAttemptResult(data);
        if (!currentUser && data.userId) {
            setCurrentUser({id: data.userId, name: "Usuário"});
        }
      } catch (err: any) {
        setError(err.message || 'Não foi possível carregar o resultado da tentativa.');
        console.error("Erro ao buscar resultado:", err);
      } finally {
        setIsLoadingResult(false);
      }
    };
    fetchAttemptResults();
  }, [attemptIdParam, currentUser]); // Adicionado currentUser para o caso de o userId vir do attemptResult e atualizar o estado

  useEffect(() => {
    const userIdToFetchFor = currentUser?.id || attemptResult?.userId;

    if (!isLoadingResult && attemptResult && userIdToFetchFor) {
        const fetchRecommendations = async () => {
          setIsLoadingRecommendations(true);
          try {
            console.log(`Buscando recomendações para userId: ${userIdToFetchFor}`);
            const response = await fetch(`http://localhost:8080/api/users/${userIdToFetchFor}/recommendations`);
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ message: "Erro ao ler corpo da resposta."}) );
              throw new Error(errorData?.message || `Erro ao buscar recomendações: ${response.statusText}`);
            }
            const data: RecommendationApiDTO = await response.json();
            setRecommendations(data.recommendedQuizzes || []);
            setRecommendationMessage(data.message || 'Confira estes outros quizzes!');
          } catch (err: any) {
            console.error("Erro ao buscar recomendações:", err);
            setRecommendationMessage('Não foi possível carregar as recomendações no momento.');
            setRecommendations([]);
          } finally {
            setIsLoadingRecommendations(false);
          }
        };
        fetchRecommendations();
    } else if (!isLoadingResult && attemptResult && !userIdToFetchFor) {
        console.warn("Não foi possível determinar o userId para buscar recomendações após carregar o resultado.");
        setIsLoadingRecommendations(false);
        setRecommendationMessage("Não foi possível carregar recomendações personalizadas (sem userId).");
    } else if (isLoadingResult) {
        // Se o resultado ainda está carregando, não faz nada ou seta recommendations loading também.
        // Já está sendo feito por setIsLoadingRecommendations(true) no início do fetch.
    }
  }, [attemptResult, currentUser, isLoadingResult]);


  if (isLoadingResult || (!attemptResult && !error && attemptIdParam) ) {
    return <div className="flex min-h-screen items-center justify-center bg-[#26244a] text-white">Carregando resultado...</div>;
  }
  if (error && !attemptResult) {
    return <div className="flex min-h-screen items-center justify-center bg-[#26244a] text-red-400">Erro: {error}</div>;
  }
  if (!attemptResult) {
    return <div className="flex min-h-screen items-center justify-center bg-[#26244a] text-white">Resultado da tentativa não encontrado.</div>;
  }

  const score = attemptResult.score;

  return (
    // Envolve todo o conteúdo em um fragmento ou div principal se necessário
    // Adicionei min-h-screen e padding ao container principal para melhor visualização da página de resultados
    <div className="min-h-screen bg-[#1e1c42] px-4 py-8 text-[#d9d8f9] md:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-col items-center text-center sm:flex-row sm:items-baseline sm:justify-between sm:text-left">
            <div>
                <h1 className="text-3xl font-extrabold text-[#d9d8f9] md:text-4xl">
                    Resultado do Quiz: {attemptResult.quizName}
                </h1>
                {currentUser && <p className="mt-1 text-lg text-[#c0bfde]">Para: {currentUser.name}</p>}
            </div>
            <span className="mt-2 text-4xl font-extrabold text-[#faca3c] sm:mt-0">
            {score.toFixed(0)}%
            </span>
        </header>
        <hr className="border-[#7a799c]" />

        {attemptResult.answerFeedbacks.map((feedback, index) => (
            <div key={feedback.questionId} className="mt-8">
                <p className="text-sm leading-relaxed text-[#d9d8f9] lg:text-base">
                <span className="font-semibold">{index + 1}.</span> {feedback.questionBody}
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                {feedback.selectedAlternativeId !== null ? (
                    <li className="flex items-start gap-3 rounded-md border border-transparent p-2">
                    <div
                        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-extrabold ${
                        feedback.correct
                            ? 'bg-[#18d38d] text-white'
                            : 'bg-[#ff4c4c] text-white'
                        }`}
                    >
                        {feedback.correct ? <HandThumbUpIcon className="h-5 w-5" /> : <XMarkIcon className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                        <p className={`font-medium ${feedback.correct ? 'text-[#18d38d]' : 'text-[#ff4c4c]'}`}>
                        Sua resposta: <span className="font-normal">{feedback.selectedAlternativeBody}</span>
                        </p>
                    </div>
                    <span className={`ml-auto text-sm font-semibold ${feedback.correct ? 'text-[#18d38d]' : 'text-[#ff4c4c]'}`}>
                        {feedback.correct ? "Correta" : "Incorreta"}
                    </span>
                    </li>
                ) : (
                    <li className="flex items-start gap-3 rounded-md border border-transparent p-2">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-base font-extrabold text-white">
                        -
                    </div>
                    <p className="flex-1 font-medium text-slate-400">Não respondida</p>
                    </li>
                )}
                {!feedback.correct && feedback.selectedAlternativeId !== null && (
                    <li className="flex items-start gap-3 rounded-md border border-transparent bg-sky-900/30 p-2">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-base font-extrabold text-white">
                        <HandThumbUpIcon className="h-5 w-5"/>
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-sky-300">
                        Resposta correta: <span className="font-normal">{feedback.correctAlternativeBody}</span>
                        </p>
                    </div>
                    </li>
                )}
                </ul>
                {feedback.justification && (
                    <div className="mt-3 rounded-md bg-slate-700/50 p-3">
                        <p className="text-xs text-slate-300"><span className="font-semibold text-slate-100">Justificativa:</span> {feedback.justification}</p>
                    </div>
                )}
                <Divider />
            </div>
            ))}

        <h2 className="mt-12 text-2xl font-extrabold text-[#d9d8f9]">
            {recommendationMessage || (recommendations.length > 0 ? 'Exercícios Recomendados' : 'Nenhuma recomendação por enquanto')}
        </h2>
        <div className="mt-6 flex flex-col gap-6">
            {isLoadingRecommendations && recommendations.length === 0 && ( // Mostra carregando apenas se não há recomendações ainda
                <p className="text-center">Carregando recomendações...</p>
            )}
            {/* Se não está carregando E não tem recomendações E tem uma mensagem específica (ex: erro ou "sem recomendações") */}
            {!isLoadingRecommendations && recommendations.length === 0 && recommendationMessage && (
                 <p className="text-center">{recommendationMessage}</p>
            )}
            {/* Renderiza os cards se houver recomendações */}
            {recommendations.map(rec => (
            <ExerciseCard
                key={rec.id}
                title={rec.name}
                summary={rec.description}
                href={`/quizzes/${rec.id}`}
                difficulty={rec.difficulty} // MODIFICADO: Passando a dificuldade
            />
            ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
            onClick={() => {
                router.push(`/quizzes/${quizIdFromRoute}`);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#18d38d] px-6 py-2 text-sm font-semibold text-[#18d38d] transition hover:bg-[#153e34]/20 sm:w-auto"
            >
            <ArrowPathIcon className="h-5 w-5" />
            Tentar Novamente este Quiz
            </button>
            <Link
            href="/quizzes"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#18d38d] px-6 py-2 text-sm font-semibold text-white transition hover:brightness-110 sm:w-auto"
            >
            <HomeIcon className="h-5 w-5" />
            Ver Outros Exercícios
            </Link>
        </div>
      </div>
    </div>
  );
}