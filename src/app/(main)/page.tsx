import ExerciseCard from '@/app/components/exercise/ExerciseCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exercícios',
};

const exercises = [
  {
    id: 1,
    title: 'Literatura - Interpretação de Texto',
    summary: 'Resumo sobre o tema do Quiz e como serão as perguntas',
  },
  {
    id: 2,
    title: 'Literatura - Interpretação de Texto',
    summary: 'Resumo sobre o tema do Quiz e como serão as perguntas',
  },
  {
    id: 3,
    title: 'Literatura - Interpretação de Texto',
    summary: 'Resumo sobre o tema do Quiz e como serão as perguntas',
  },
    {
    id: 4,
    title: 'Literatura - Interpretação de Texto',
    summary: 'Resumo sobre o tema do Quiz e como serão as perguntas',
  },
];

export default function ExercisesPage() {
  return (
    <section className="bg-[#26244a] px-4 pb-16 pt-10 text-[#d9d8f9]">
      {/* título + subtítulo */}
      <header className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-extrabold">Exercícios</h1>
        <hr className="my-2 border-[#7a799c]" />
        <p className="text-sm lg:text-base leading-relaxed">
          Escolha um exercício e comece seu aprendizado.
        </p>
      </header>

      {/* lista de cartões */}
      <div className="mx-auto mt-8 flex max-w-4xl flex-col gap-6">
        {exercises.map((ex) => (
          <ExerciseCard
            key={ex.id}
            title={ex.title}
            summary={ex.summary}
            href={`/quiz/${ex.id}`}
          />
        ))}
      </div>
    </section>
  );
}
