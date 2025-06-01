'use client';

import { useEffect, useState, useRef } from 'react'; // Adicionado useRef
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/solid';

// Interfaces para os dados da API e estado local
interface CurrentUser {
  id: number;
  name: string;
}

interface AlternativeApiDTO {
  id: number;
  body: string;
  position: number;
}

interface QuestionApiDTO {
  id: number;
  body: string;
  difficulty: number;
  alternatives: AlternativeApiDTO[];
}

interface QuizDisplayApiDTO {
  attemptId: number;
  quizName: string;
  questions: QuestionApiDTO[];
}

export default function QuizShowPage() {
  const router = useRouter();
  const params = useParams();
  const quizIdFromRoute = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [quizData, setQuizData] = useState<QuizDisplayApiDTO | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]); 

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para submissão de resposta
  const [error, setError] = useState<string | null>(null);

  const attemptStartedRef = useRef(false); // Ref para controlar a chamada inicial do quiz

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      router.replace('/login');
      return;
    }
    let parsedUser: CurrentUser;
    try {
        parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
    } catch(e) {
        console.error("Erro ao parsear usuário do localStorage:", e);
        localStorage.removeItem('currentUser');
        router.replace('/login');
        return;
    }
    
    if (!quizIdFromRoute) {
        setError("ID do Quiz não encontrado na rota.");
        setIsLoading(false);
        return;
    }

    // Prevenir chamada dupla ao iniciar o quiz em StrictMode
    if (attemptStartedRef.current) {
        // Se já iniciou e quizData não está pronto, talvez ainda esteja carregando
        // ou houve um erro. O estado de isLoading já deve estar sendo gerenciado.
        // Se quizData já existe, não faz nada.
        if(!quizData && !error){
            // Isso pode indicar que o quizIdFromRoute mudou e precisamos recarregar,
            // mas a lógica atual do ref é para a primeira montagem.
            // Para recarregar com novo quizId, o ref precisaria ser resetado.
            // Por ora, focamos na primeira carga.
        }
        return; 
    }
    attemptStartedRef.current = true;


    const startQuizAttempt = async () => {
      if (!parsedUser || !quizIdFromRoute) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8080/api/attempts/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizId: parseInt(quizIdFromRoute, 10),
            userId: parsedUser.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Erro ao iniciar o quiz: ${response.statusText}`);
        }

        const data: QuizDisplayApiDTO = await response.json();
        setQuizData(data);
        setAttemptId(data.attemptId);
        setAnswers(Array(data.questions.length).fill(null));
      } catch (err: any) {
        setError(err.message || 'Não foi possível carregar o quiz.');
        console.error("Erro ao iniciar quiz:", err);
      } finally {
        setIsLoading(false);
      }
    };

    startQuizAttempt();
  }, [router, quizIdFromRoute]); // Removido currentUser, pois é pego no início do effect.
                                  // A lógica do ref cuida da execução única para startQuizAttempt.

  const handleSelectAlternative = async (optionId: number) => {
    if (isSubmitting || !attemptId || !quizData) return;

    const currentQuestion = quizData.questions[currentQuestionIndex];
    if (!currentQuestion) return;
    const currentQuestionId = currentQuestion.id;

    // Otimismo na UI: atualiza localmente primeiro
    const newAnswers = [...answers];
    const previousSelectedAlternativeId = newAnswers[currentQuestionIndex]; // Salva o anterior
    newAnswers[currentQuestionIndex] = optionId;
    setAnswers(newAnswers);
    setIsSubmitting(true); // Indica que uma submissão está em progresso
    setError(null); // Limpa erros anteriores

    try {
      console.log(`Enviando resposta para o backend: AttemptID=${attemptId}, QuestionID=${currentQuestionId}, SelectedAlternativeID=${optionId}`);
      
      const response = await fetch(`http://localhost:8080/api/attempts/${attemptId}/answer`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: currentQuestionId,
          selectedAlternativeId: optionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao ler corpo da resposta de erro." }));
        console.error(`Erro ao submeter resposta para o backend: ${response.status} ${response.statusText}`, errorData);
        setError(`Falha ao salvar resposta. (Status: ${response.status})`);
        // Reverte a seleção na UI em caso de erro
        const revertedAnswers = [...newAnswers]; // Cria cópia a partir do estado já "otimista"
        revertedAnswers[currentQuestionIndex] = previousSelectedAlternativeId; // Reverte para o anterior
        setAnswers(revertedAnswers);
      } else {
        console.log(`Resposta para questão ${currentQuestionIndex + 1} (ID ${currentQuestionId}) submetida com sucesso ao backend.`);
      }
    } catch (err: any) {
      console.error("Erro de rede ou outro erro ao submeter resposta:", err);
      setError("Erro de rede ao tentar salvar sua resposta. Verifique sua conexão.");
      // Reverte a seleção na UI em caso de erro de rede
      const revertedAnswers = [...newAnswers];
      revertedAnswers[currentQuestionIndex] = previousSelectedAlternativeId;
      setAnswers(revertedAnswers);
    } finally {
      setIsSubmitting(false); // Finaliza o estado de submissão
    }
  };

  const gotoQuestion = (offset: number) => {
    if (isSubmitting) return; // Não permite navegar enquanto submete
    setCurrentQuestionIndex(prev => {
        const newIndex = prev + offset;
        if (newIndex >= 0 && quizData && newIndex < quizData.questions.length) {
            return newIndex;
        }
        return prev; // Mantém o índice se estiver fora dos limites
    });
  };

 const handleFinishQuiz = async () => {
    if (isSubmitting || !attemptId) { // Verifica também isSubmitting
      setError("ID da tentativa não encontrado ou uma resposta ainda está sendo submetida.");
      return;
    }
    setIsLoading(true); // Usar isLoading para feedback de finalização
    setError(null);
    try {
        console.log(`Finalizando quiz. Attempt ID: ${attemptId} no backend.`);
        
        const response = await fetch(`http://localhost:8080/api/attempts/${attemptId}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // O corpo não é necessário para este endpoint específico do seu backend,
            // mas se fosse, seria adicionado aqui.
        });

        if(!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Erro ao tentar ler corpo da resposta de erro." }));
            throw new Error(errorData?.message || `Erro ao finalizar o quiz: ${response.status} ${response.statusText}`);
        }
        
        // A resposta do /complete é o AttemptResultDTO, mas não precisamos usá-lo diretamente aqui
        // pois a página de resultados buscará novamente para garantir dados frescos.
        const resultData = await response.json(); 
        console.log("Quiz finalizado no backend. Resultado preliminar recebido:", resultData);

        // Redireciona para a página de resultados, passando o attemptId
        router.push(`/quizzes/${quizIdFromRoute}/resultados?attemptId=${attemptId}`);

    } catch (err: any) {
        setError(err.message || 'Não foi possível finalizar o quiz.');
        console.error("Erro ao finalizar quiz:", err);
    } finally {
        setIsLoading(false); // Desativa o feedback de carregamento
    }
  };

  // Estados de Carregamento e Erro Iniciais
  if (isLoading && !quizData) { // Mostra carregando se isLoading é true E quizData ainda não foi carregado
    return <div className="flex min-h-screen items-center justify-center bg-[#26244a] text-white">Carregando quiz...</div>;
  }
  if (error && !quizData) { // Mostra erro apenas se não houver quizData (erro fatal no carregamento)
    return <div className="flex min-h-screen items-center justify-center bg-[#26244a] text-red-400">Erro: {error}</div>;
  }
  if (!quizData || quizData.questions.length === 0) {
    return <div className="flex min-h-screen items-center justify-center bg-[#26244a] text-white">Quiz não encontrado ou sem questões.</div>;
  }

  // Após o carregamento bem-sucedido
  const currentQuestion = quizData.questions[currentQuestionIndex];
  const selectedAlternativeId = answers[currentQuestionIndex];

  return (
    <>
      <header className="mb-6 flex items-baseline justify-between text-[#d9d8f9]">
        <h1 className="text-4xl font-extrabold">{quizData.quizName}</h1>
        <span className="text-xl font-semibold">
          {currentQuestionIndex + 1}/{quizData.questions.length}
        </span>
      </header>
      <hr className="border-[#7a799c]" />

      {/* Exibir erro de submissão de resposta, se houver */}
      {error && <p className="my-4 text-center text-red-400">{error}</p>}


      <p className="mt-6 text-sm leading-relaxed text-[#d9d8f9] lg:text-base">
        <span className="font-semibold">{currentQuestionIndex + 1}.</span>{' '}
        {currentQuestion.body}
      </p>

      <ul className="mt-8 flex flex-col gap-8">
        {currentQuestion.alternatives.map((alt, index) => { // Adicionado index para letra
          const isActive = selectedAlternativeId === alt.id;
          return (
            <li
              key={alt.id}
              onClick={() => !isSubmitting && handleSelectAlternative(alt.id)} // Desabilita click durante submissão
              className={`flex cursor-pointer items-center gap-6 transition ${
                isActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'
              } ${isSubmitting ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-extrabold ${
                  isActive
                    ? 'bg-[#18d38d] text-white'
                    : 'bg-[#e9e8fd] text-[#110b3e]'
                }`}
              >
                {String.fromCharCode(65 + index)} {/* Usar index para A, B, C... */}
              </div>
              <p className="text-[#d9d8f9]">{alt.body}</p>
            </li>
          );
        })}
      </ul>

      <div className="mt-12 flex justify-end gap-4">
        <button
          disabled={currentQuestionIndex === 0 || isSubmitting}
          onClick={() => gotoQuestion(-1)}
          className="flex items-center gap-1 rounded-full border-2 border-[#18d38d] px-8 py-2 text-sm font-semibold text-[#18d38d] transition hover:bg-[#153e34]/20 disabled:opacity-40 lg:text-base"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar
        </button>

        {currentQuestionIndex < quizData.questions.length - 1 ? (
          <button
            disabled={selectedAlternativeId === null || isSubmitting}
            onClick={() => gotoQuestion(1)}
            className="flex items-center gap-1 rounded-full bg-[#18d38d] px-8 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-40 lg:text-base"
          >
            Avançar
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        ) : (
          <button
            disabled={selectedAlternativeId === null || isSubmitting}
            onClick={handleFinishQuiz}
            className="flex items-center gap-1 rounded-full bg-[#18d38d] px-8 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-40 lg:text-base"
          >
            {isLoading ? "Finalizando..." : "Finalizar"} {/* Feedback no botão finalizar */}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </>
  );
}