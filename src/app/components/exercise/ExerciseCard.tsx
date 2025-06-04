// app/components/exercise/ExerciseCard.tsx (ou onde quer que seu arquivo esteja)

import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

type Props = {
  title: string;
  summary: string;
  href: string;
  difficulty?: number; // NOVO: Prop para dificuldade, opcional para manter compatibilidade
};

// NOVO: Função para mapear o número da dificuldade para um texto
const getDifficultyText = (level?: number): string => {
  if (level === undefined) return '';
  if (level <= 1) return 'Fácil';
  if (level === 2) return 'Médio';
  if (level >= 3) return 'Difícil';
  return 'N/A'; // Texto padrão se o nível não for reconhecido
};

// NOVO: Função para obter a cor da tag de dificuldade (usando classes Tailwind CSS)
const getDifficultyTagStyle = (level?: number): string => {
  if (level === undefined) return 'bg-gray-400 text-gray-800'; // Cor padrão
  if (level <= 1) return 'bg-green-200 text-green-800'; // Fácil
  if (level === 2) return 'bg-yellow-200 text-yellow-800'; // Médio
  if (level >= 3) return 'bg-red-200 text-red-800';    // Difícil
  return 'bg-gray-400 text-gray-800';
};

export default function ExerciseCard({ title, summary, href, difficulty }: Props) {
  const difficultyText = getDifficultyText(difficulty);
  const difficultyTagStyle = getDifficultyTagStyle(difficulty);

  return (
    <article className="flex items-center justify-between rounded-xl bg-[#e9e8fd] px-6 py-6 text-[#110b3e]">
      <div className="max-w-[calc(100%-150px)] pr-4"> {/* Ajustado para dar espaço ao botão e tag */}
        <div className="flex items-center gap-2 mb-1"> {/* NOVO: Container para título e tag */}
          <h3 className="text-xl font-semibold">{title}</h3>
          {difficultyText && ( // NOVO: Renderiza a tag de dificuldade se o texto existir
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyTagStyle}`}
            >
              {difficultyText}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed">{summary}</p>
      </div>

      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#18d38d] px-6 py-2 text-sm font-semibold text-white transition hover:brightness-110 lg:text-base"
      >
        Começar Quiz
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </article>
  );
}