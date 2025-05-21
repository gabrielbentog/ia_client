import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

type Props = {
  title: string;
  summary: string;
  href: string;
};

export default function ExerciseCard({ title, summary, href }: Props) {
  return (
    <article className="flex items-center justify-between rounded-xl bg-[#e9e8fd] px-6 py-6 text-[#110b3e]">
      <div className="max-w-[65%]">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed">{summary}</p>
      </div>

      <Link
        href={href}
        className="inline-flex items-center gap-1 rounded-full bg-[#18d38d] px-6 py-2 text-sm font-semibold text-white transition hover:brightness-110"
      >
        Começar Quiz
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </article>
  );
}
