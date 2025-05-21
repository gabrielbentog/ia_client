'use client';

import { useSearchParams, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HandThumbUpIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import ExerciseCard from '@/app/components/exercise/ExerciseCard';
import Divider from '@/app/components/Divider';

/* ─────────  MESMO MOCK DE PERGUNTAS ───────── */
const quiz = {
  title: 'Matemática - Interpretação de Texto',
  questions: [
    {
      id: 1,
      text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris.`,
      options: [
        'Opção A da primeira pergunta.',
        'Opção B da primeira pergunta.',
        'Opção C da primeira pergunta.',
        'Opção D da primeira pergunta.',
      ],
      correctIndex: 1,
      studentAnswer: 1,
    },
    {
      id: 2,
      text: 'Pergunta número dois: lorem ipsum dolor sit amet, consectetur.',
      options: [
        'Opção A da segunda pergunta.',
        'Opção B da segunda pergunta.',
        'Opção C da segunda pergunta.',
        'Opção D da segunda pergunta.',
      ],
      correctIndex: 2,
      studentAnswer: 0,
    },
    {
      id: 3,
      text: 'Terceira e última pergunta: lorem ipsum dolor sit amet.',
      options: [
        'Opção A da terceira pergunta.',
        'Opção B da terceira pergunta.',
        'Opção C da terceira pergunta.',
        'Opção D da terceira pergunta.',
      ],
      correctIndex: 3,
      studentAnswer: 3,
    },
  ],
};
/* ────────────────────────────────────────────── */

/** Mock de recomendações (igual ao anterior) */
const recommendations = [
  {
    id: 11,
    title: 'Literatura - Interpretação de Texto',
    summary: 'Resumo sobre o tema do Quiz e como serão as perguntas',
    href: '/quiz/11',
  },
  {
    id: 12,
    title: 'Literatura - Interpretação de Texto',
    summary: 'Resumo sobre o tema do Quiz e como serão as perguntas',
    href: '/quiz/12',
  },
  {
    id: 13,
    title: 'Literatura - Interpretação de Texto',
    summary: 'Resumo sobre o tema do Quiz e como serão as perguntas',
    href: '/quiz/13',
  },
];

export default function QuizResultPage() {
  const router = useRouter();
  const { id } = useParams();
  const search = useSearchParams();
  const answersParam = search.get('answers') || '';
  // transforma "0,2,1" em [0,2,1], pulando vazios como null
  const studentAnswers = answersParam.split(',').map(s =>
    s === '' ? null : parseInt(s, 10)
  );

  // calculo de acertos
  const correctCount = quiz.questions.filter(
    (q, i) => studentAnswers[i] === q.correctIndex
  ).length;
  const score = Math.round((correctCount / quiz.questions.length) * 100);

  return (
    <>
      {/* Cabeçalho */}
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="text-4xl font-extrabold text-[#d9d8f9]">
          Resultado
        </h1>
        <span className="text-4xl font-extrabold text-[#faca3c]">
          {score}%
        </span>
      </header>
      <hr className="border-[#7a799c]" />

      {/* Cada pergunta */}
      {quiz.questions.map((q, i) => {
        const student = studentAnswers[i];
        return (
          <div key={q.id} className="mt-8">
            {/* Texto da pergunta */}
            <p className="text-sm lg:text-base leading-relaxed text-[#d9d8f9]">
              <span className="font-semibold">{i + 1}.</span> {q.text}
            </p>

            {/* Opções */}
            <ul className="mt-4 flex flex-col gap-4">
              {q.options.map((opt, idx) => {
                const isCorrect = idx === q.correctIndex;
                const isSelected = idx === student;
                return (
                  <li key={idx} className="flex items-center gap-4">
                    {/* bolha colorida */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-extrabold ${
                        isCorrect
                          ? 'bg-[#18d38d] text-white'
                          : 'bg-[#ff4c4c] text-white'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    {/* texto */}
                    <p
                      className={`flex-1 ${
                        isCorrect ? 'text-[#18d38d]' : 'text-[#ff4c4c]'
                      }`}
                    >
                      {opt}
                    </p>
                    {/* só exibe feedback ao lado do que ele selecionou */}
                    {isSelected && (
                      <span className="ml-auto flex items-center gap-1 text-sm font-semibold">
                        {isCorrect ? (
                          <>
                            Você Acertou
                            <HandThumbUpIcon className="h-4 w-4 text-[#18d38d]" />
                          </>
                        ) : (
                          <>
                            Você Errou
                            <XMarkIcon className="h-4 w-4 text-[#ff4c4c]" />
                          </>
                        )}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* divisor */}
            <Divider />
          </div>
        );
      })}

      {/* Recomendados */}
      <h2 className="mt-12 text-2xl font-extrabold text-[#d9d8f9]">
        Exercícios Recomendados
      </h2>
      <div className="mt-6 flex flex-col gap-6">
        {recommendations.map(ex => (
          <ExerciseCard
            key={ex.id}
            title={ex.title}
            summary={ex.summary}
            href={ex.href}
          />
        ))}
      </div>

      {/* botões finais */}
      <div className="mt-12 flex justify-center gap-4">
        <button
          onClick={() => router.push(`/quiz/${id}`)}
          className="flex items-center gap-2 rounded-full border-2 border-[#18d38d] px-6 py-2 text-sm font-semibold text-[#18d38d] transition hover:bg-[#153e34]/20"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Tentar Novamente
        </button>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 rounded-full bg-[#18d38d] px-6 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          <XMarkIcon className="h-5 w-5" />
          Sair do Quiz
        </button>
      </div>
    </>
  );
}
