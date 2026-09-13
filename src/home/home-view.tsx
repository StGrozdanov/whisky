import Image from "next/image";
import { ORIGIN_LABELS } from "@/shop/origin-labels";
import type { HomePage } from "@/shop/types";

type HomeViewProps = {
  home: HomePage;
};

export function HomeView({ home }: HomeViewProps) {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/4 h-[700px] w-[700px] rounded-full bg-primary/5 blur-[140px]" />
      <div className="pointer-events-none absolute top-[600px] right-10 h-[500px] w-[500px] rounded-full bg-secondary-container/10 blur-[120px]" />

      {home.housePick ? <HousePickSection housePick={home.housePick} /> : null}

      <ClubTeaser />

      {home.whiskies.length > 0 ? (
        <WhiskyRail whiskies={home.whiskies} />
      ) : null}

      <FinderCta />
    </div>
  );
}

function HousePickSection({
  housePick,
}: {
  housePick: NonNullable<HomePage["housePick"]>;
}) {
  const originLabel = ORIGIN_LABELS[housePick.whisky.origin];

  return (
    <section
      aria-labelledby="house-pick-heading"
      className="mx-auto max-w-[1440px] px-gutter-mobile py-space-xl md:px-gutter"
    >
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-space-xl shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-primary-container/10 blur-3xl" />
        <div className="relative z-10 grid grid-cols-1 items-center gap-space-xl lg:grid-cols-12">
          <div className="flex flex-col items-center lg:col-span-5">
            <div className="relative flex aspect-[4/5] w-full max-w-sm items-center justify-center overflow-hidden rounded-xl bg-surface-container-lowest shadow-xl">
              <Image
                alt={housePick.whisky.name}
                className="h-4/5 w-auto object-contain"
                height={480}
                src={housePick.whisky.photoUrl}
                unoptimized
                width={320}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-space-md lg:col-span-7">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="rounded-full bg-secondary px-space-sm py-1 text-label-sm font-bold tracking-wider text-on-secondary uppercase">
                УИСКИ НА МЕСЕЦА
                {housePick.monthLabel ? ` • ${housePick.monthLabel}` : ""}
              </span>
              <span className="rounded-full bg-surface-container-high px-space-sm py-1 text-label-sm tracking-wider text-primary uppercase">
                {originLabel}
              </span>
            </div>

            <div>
              <h1
                className="font-headline text-headline-lg text-on-surface md:text-headline-hero"
                id="house-pick-heading"
              >
                {housePick.whisky.name}
              </h1>
              <p className="mt-space-sm font-headline text-headline-sm text-secondary italic">
                {housePick.story}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClubTeaser() {
  return (
    <section
      aria-labelledby="club-teaser-heading"
      className="mx-auto mb-6 max-w-[1440px] px-gutter-mobile md:px-gutter"
    >
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-space-lg shadow-xl md:p-space-xl">
        <div className="relative z-10 grid grid-cols-1 items-center gap-space-lg lg:grid-cols-12">
          <div className="flex flex-col gap-space-sm lg:col-span-7">
            <h2
              className="font-headline text-headline-md text-on-surface"
              id="club-teaser-heading"
            >
              Стани клубен член и отключи ексклузивни привилегии
            </h2>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-lg bg-surface-container px-space-sm py-1 text-body-sm text-on-surface">
                5% отстъпка
              </span>
              <span className="rounded-lg bg-surface-container px-space-sm py-1 text-body-sm text-on-surface">
                Безплатна клубна бутилка уиски
              </span>
              <span className="rounded-lg bg-surface-container px-space-sm py-1 text-body-sm text-on-surface">
                Преференциален ранен достъп до нови бутилки
              </span>
            </div>
          </div>
          <div className="flex justify-center lg:col-span-5">
            <button
              className="w-full cursor-pointer rounded-lg bg-primary px-space-xl py-3.5 text-label-md font-bold tracking-wider text-on-primary uppercase shadow-sm transition-colors hover:bg-primary-fixed sm:w-auto"
              type="button"
            >
              Стани клубен член
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhiskyRail({ whiskies }: { whiskies: HomePage["whiskies"] }) {
  return (
    <section
      aria-labelledby="whisky-rail-heading"
      className="mx-auto max-w-[1440px] px-gutter-mobile py-space-xl md:px-gutter"
    >
      <div className="mb-space-lg">
        <p className="text-label-sm font-bold tracking-widest text-primary uppercase">
          От нашата селекция
        </p>
        <h2
          className="font-headline text-headline-lg text-on-surface"
          id="whisky-rail-heading"
        >
          Уискита в магазина
        </h2>
      </div>
      <ul className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
        {whiskies.map((whisky) => (
          <li
            className="flex flex-col rounded-xl bg-surface-container-low p-space-md transition-all hover:bg-surface-container"
            key={whisky.name}
          >
            <div className="relative mb-space-sm flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-lg bg-surface-container-lowest">
              <Image
                alt={whisky.name}
                className="h-4/5 w-auto object-contain"
                height={320}
                src={whisky.photoUrl}
                unoptimized
                width={220}
              />
            </div>
            <p className="mb-1 text-technical-data text-outline">
              {ORIGIN_LABELS[whisky.origin]}
            </p>
            <h3 className="truncate font-headline text-headline-sm text-on-surface">
              {whisky.name}
            </h3>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FinderCta() {
  return (
    <section
      aria-labelledby="finder-cta-heading"
      className="mx-auto max-w-[1440px] px-gutter-mobile py-space-xl md:px-gutter"
    >
      <div className="relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low p-space-lg shadow-2xl md:p-space-xl">
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
          <h2
            className="mb-space-xs font-headline text-headline-lg text-on-surface md:text-headline-hero"
            id="finder-cta-heading"
          >
            Открий своето идеално уиски
          </h2>
          <p className="mb-space-xl max-w-2xl text-body-lg text-on-surface-variant">
            Няколко кратки отговора за вкуса ти — Finder ще предложи до три
            уискита.
          </p>
          <button
            className="cursor-pointer rounded-xl bg-primary-container px-8 py-4 text-label-lg font-bold tracking-wider text-on-primary uppercase shadow-lg transition-all hover:scale-105 hover:bg-primary"
            type="button"
          >
            Открий своето идеално уиски
          </button>
        </div>
      </div>
    </section>
  );
}
