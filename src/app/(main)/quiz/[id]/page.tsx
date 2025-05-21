'use client';

import { useState } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/solid';

/* ─────────  MOCK  ───────── */
const quiz = {
  title: 'Nome do Quiz',
  questions: [
    {
      id: 1,
      text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. 
Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris.`,
      options: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      ],
    },
    {
      id: 2,
      text: 'Pergunta número dois: lorem ipsum dolor sit amet, consectetur.',
      options: [
        'Opção A da segunda questão.',
        'Opção B da segunda questão.',
        'Opção C da segunda questão.',
        'Opção D da segunda questão.',
      ],
    },
    {
      id: 3,
      text: 'Terceira e última pergunta: lorem ipsum dolor sit amet.',
      options: [
        'Primeira opção da terceira.',
        'Segunda opção da terceira.',
        'Terceira opção da terceira.',
        'Quarta opção da terceira.',
      ],
    },
  ],
};
/* ────────────────────────── */

export default function QuizShowPage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(quiz.questions.length).fill(null),
  );

  const question = quiz.questions[current];
  const selected = answers[current];

  const handleSelect = (idx: number) =>
    setAnswers((prev) =>
      prev.map((val, i) => (i === current ? idx : val)),
    );

  const goto = (offset: number) => setCurrent((i) => i + offset);

  return (
    <>
      {/* Título + contador */}
      <header className="mb-6 flex items-baseline justify-between text-[#d9d8f9]">
        <h1 className="text-4xl font-extrabold">{quiz.title}</h1>
        <span className="text-xl font-semibold">
          {current + 1}/{quiz.questions.length}
        </span>
      </header>
      <hr className="border-[#7a799c]" />

      {/* Enunciado */}
      <p className="mt-6 text-sm lg:text-base leading-relaxed text-[#d9d8f9]">
        <span className="font-semibold">{current + 1}.</span>{' '}
        {question.text}
      </p>

      {/* Opções */}
      <ul className="mt-8 flex flex-col gap-8">
        {question.options.map((opt, idx) => {
          const active = selected === idx;
          return (
            <li
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`flex cursor-pointer items-center gap-6 transition ${
                active ? 'opacity-100' : 'opacity-80 hover:opacity-100'
              }`}
            >
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-extrabold ${
                  active
                    ? 'bg-[#18d38d] text-white'
                    : 'bg-[#e9e8fd] text-[#110b3e]'
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </div>
              <p className="text-[#d9d8f9]">{opt}</p>
            </li>
          );
        })}
      </ul>

      {/* Navegação */}
      <div className="mt-12 flex justify-end gap-4">
        <button
          disabled={current === 0}
          onClick={() => goto(-1)}
          className="flex items-center gap-1 rounded-full border-2 border-[#18d38d] px-8 py-2 text-sm lg:text-base font-semibold text-[#18d38d] transition hover:bg-[#153e34]/20 disabled:opacity-40"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar
        </button>

        {current < quiz.questions.length - 1 ? (
          <button
            disabled={selected === null}
            onClick={() => goto(1)}
            className="flex items-center gap-1 rounded-full bg-[#18d38d] px-8 py-2 text-sm lg:text-base font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
          >
            Avançar
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        ) : (
          <button
            disabled={selected === null}
            onClick={() =>
              alert(
                `Respostas: ${answers
                  .map((a) => (a !== null ? String.fromCharCode(65 + a) : '-'))
                  .join(', ')}`,
              )
            }
            className="flex items-center gap-1 rounded-full bg-[#18d38d] px-8 py-2 text-sm lg:text-base font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
          >
            Finalizar
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </>
  );
}
