import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon";

type DiscoveryPageLayoutProps = {
  title: string;
  intro: string;
  children: ReactNode;
};

export function DiscoveryPageLayout({
  title,
  intro,
  children,
}: DiscoveryPageLayoutProps) {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[140px]" />
      <div className="pointer-events-none absolute top-[400px] right-10 h-[400px] w-[400px] rounded-full bg-secondary-container/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-gutter-mobile py-space-xl md:px-gutter">
        <nav
          aria-label="Пътека"
          className="mb-space-md flex items-center gap-2 text-technical-data text-on-surface-variant/70"
        >
          <Link className="cursor-pointer hover:text-primary" href="/">
            Начало
          </Link>
          <span>/</span>
          <span className="font-medium text-secondary">{title}</span>
        </nav>

        <header className="mb-space-lg max-w-3xl space-y-space-xs">
          <h1 className="font-headline text-headline-lg text-on-surface">
            {title}
          </h1>
          <p className="text-body-lg text-on-surface-variant">{intro}</p>
        </header>

        {children}
      </div>
    </div>
  );
}

type DiscoveryEmptyStateProps = {
  icon: IconName;
  title: string;
  text: string;
};

export function DiscoveryEmptyState({
  icon,
  title,
  text,
}: DiscoveryEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-space-md rounded-2xl bg-surface-container-low px-space-lg py-space-xl text-center">
      <Icon className="text-outline" fontSize={32} name={icon} />
      <h2 className="font-headline text-headline-md text-on-surface">
        {title}
      </h2>
      <p className="max-w-lg text-body-md text-on-surface-variant">{text}</p>
      <Link
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-space-xl py-3 text-label-md font-bold text-on-primary uppercase tracking-wider transition-colors hover:bg-primary-fixed"
        href="/catalogue"
      >
        Към селекцията
      </Link>
    </div>
  );
}

export function DiscoveryGridSkeleton({ columns }: { columns: 2 | 4 }) {
  const gridClass =
    columns === 2
      ? "grid grid-cols-1 gap-space-xl lg:grid-cols-2"
      : "grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4";
  const placeholders = ["a", "b", "c", "d"];

  return (
    <div className="relative w-full overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-gutter-mobile py-space-xl md:px-gutter">
        <div className="mb-space-md h-4 w-32 animate-pulse rounded bg-surface-container" />
        <div className="mb-space-lg h-16 max-w-3xl animate-pulse rounded-xl bg-surface-container-low" />
        <div aria-hidden="true" className={gridClass}>
          {placeholders.map((key) => (
            <div
              className="h-96 animate-pulse rounded-xl bg-surface-container-low"
              key={key}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
