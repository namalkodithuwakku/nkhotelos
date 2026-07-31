import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type ModuleCard = {
  title: string;
  description: string;
  status?: "Ready" | "Planned" | "Connected";
};

export default function PlannedModulePage({
  eyebrow,
  title,
  description,
  icon: Icon,
  cards,
  primaryAction,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  cards: ModuleCard[];
  primaryAction?: { label: string; href: string };
}) {
  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-5 text-[#20252b] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2df] text-[#d97706]">
                <Icon size={24} strokeWidth={2.1} />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d97706]">{eyebrow}</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#68717d] sm:text-base">{description}</p>
            </div>
            {primaryAction ? (
              <Link href={primaryAction.href} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#20252b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2f353d]">
                {primaryAction.label}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-extrabold">{card.title}</h2>
                <span className="rounded-full bg-[#fff2df] px-2.5 py-1 text-[11px] font-bold text-[#b96200]">{card.status ?? "Planned"}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#68717d]">{card.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
