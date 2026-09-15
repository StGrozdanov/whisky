import {
  DiscoverySetCard,
  NewArrivalCard,
  OfferCard,
} from "@/app/_components/home-rail-cards";
import { HomeRailCarousel } from "@/app/_components/home-rail-carousel";
import {
  DISCOVERY_SETS,
  NEW_ARRIVALS,
  SPECIAL_OFFERS,
} from "@/app/_components/home-rail-data";
import { HousePickMedia } from "@/app/_components/house-pick-media";
import { Icon } from "@/components/icon";
import type { HomePage, HousePick, HousePickNote } from "@/shop/types";
import { ORIGIN_LABELS } from "@/utils/origin-labels";

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

      <div className="mx-auto flex max-w-[1440px] flex-col gap-space-xl px-gutter-mobile py-space-xl md:px-gutter">
        <HomeRailCarousel
          eyebrow={{
            label: "Лимитирани Промоции",
            icon: "local_offer",
            className: "text-secondary",
          }}
          headingId="special-offers-heading"
          nextLabel="Следващи оферти"
          prevLabel="Предишни оферти"
          slideBasis="quarter"
          title="Специални Оферти"
        >
          {SPECIAL_OFFERS.map((offer) => (
            <OfferCard card={offer} key={offer.name} />
          ))}
        </HomeRailCarousel>

        <HomeRailCarousel
          eyebrow={{
            label: "Пресни Попълнения",
            icon: "fiber_new",
            className: "text-primary",
          }}
          headingId="new-arrivals-heading"
          nextLabel="Следващи нови уискита"
          prevLabel="Предишни нови уискита"
          slideBasis="quarter"
          title="Нови уискита"
        >
          {NEW_ARRIVALS.map((arrival) => (
            <NewArrivalCard card={arrival} key={arrival.name} />
          ))}
        </HomeRailCarousel>
      </div>

      <div className="mx-auto max-w-[1440px] px-gutter-mobile py-space-xl md:px-gutter">
        <div className="rounded-2xl bg-surface-container-low p-space-xl shadow-xl">
          <HomeRailCarousel
            headingId="discovery-sets-heading"
            nextLabel="Следващи discovery сетове"
            prevLabel="Предишни discovery сетове"
            slideBasis="half"
            title="50ml Discovery Сетове"
          >
            {DISCOVERY_SETS.map((set) => (
              <DiscoverySetCard card={set} key={set.title} />
            ))}
          </HomeRailCarousel>
        </div>
      </div>

      <FinderCta />
    </div>
  );
}

function HousePickSection({ housePick }: { housePick: HousePick }) {
  const originLabel = ORIGIN_LABELS[housePick.whisky.origin];
  const techChip = technicalChipLabel(
    housePick.whisky.abv,
    housePick.whisky.nonChillFiltered,
  );

  return (
    <section
      aria-labelledby="house-pick-heading"
      className="mx-auto max-w-[1440px] px-gutter-mobile py-space-xl md:px-gutter"
    >
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-space-xl shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-primary-container/10 blur-3xl" />
        <div className="relative z-10 grid grid-cols-1 items-center gap-space-xl lg:grid-cols-12">
          <div className="flex flex-col items-center lg:col-span-5">
            <HousePickMedia
              name={housePick.whisky.name}
              photoUrl={housePick.whisky.photoUrl}
              youtubeUrl={housePick.youtubeUrl}
            />
          </div>

          <div className="flex flex-col space-y-space-md lg:col-span-7">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="rounded-full bg-secondary px-space-sm py-1 text-label-sm font-bold text-on-secondary uppercase tracking-wider">
                УИСКИ НА МЕСЕЦА
                {housePick.monthLabel ? ` • ${housePick.monthLabel}` : ""}
              </span>
              <span className="rounded-full bg-surface-container-high px-space-sm py-1 text-label-sm text-primary uppercase tracking-wider">
                {originLabel}
              </span>
              {techChip ? (
                <span className="rounded-full bg-surface-container-high px-space-sm py-1 text-technical-data text-on-surface-variant">
                  {techChip}
                </span>
              ) : null}
            </div>

            <div>
              <h1
                className="font-headline text-headline-lg text-on-surface"
                id="house-pick-heading"
              >
                {housePick.whisky.name}
              </h1>
              <p className="font-headline text-headline-sm text-secondary italic">
                {housePick.story}
              </p>
            </div>

            {housePick.note ? (
              <HousePickNoteCard note={housePick.note} />
            ) : null}

            {housePick.displayPriceEur !== undefined ? (
              <div className="flex items-center gap-space-lg pt-space-sm">
                <span className="font-headline text-headline-hero leading-none font-bold text-primary">
                  {formatPriceEur(housePick.displayPriceEur)}
                </span>
                <button
                  className="flex cursor-pointer items-center justify-center gap-space-xs rounded-lg bg-primary px-space-xl py-3.5 text-label-lg font-bold text-on-primary uppercase tracking-wider shadow-md transition-colors hover:bg-primary-fixed"
                  type="button"
                >
                  <Icon fontSize={20} name="shopping_bag" />
                  <span>Купи</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function HousePickNoteCard({ note }: { note: HousePickNote }) {
  return (
    <div className="relative rounded-xl bg-surface-container p-space-md">
      <div className="mb-space-xs flex items-start justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container font-headline text-headline-sm font-bold text-on-primary-container">
            {authorInitials(note.authorName)}
          </div>
          <div>
            <h2 className="text-label-md font-bold text-on-surface">
              {note.authorName}
            </h2>
            {note.authorRole ? (
              <span className="text-technical-data text-on-surface-variant">
                {note.authorRole}
              </span>
            ) : null}
          </div>
        </div>
        {note.score !== undefined ? (
          <div className="flex items-center gap-1 rounded-lg bg-surface-container-highest px-space-sm py-1">
            <Icon className="text-secondary" fontSize={18} name="star" />
            <span className="text-label-md font-bold text-on-surface">
              {formatOneDecimal(note.score)} / 10
            </span>
          </div>
        ) : null}
      </div>
      <p className="text-body-md text-on-surface-variant italic">
        {note.quote}
      </p>
    </div>
  );
}

function technicalChipLabel(
  abv: number | undefined,
  nonChillFiltered: boolean | undefined,
): string | undefined {
  const parts: string[] = [];

  if (abv !== undefined) {
    parts.push(`${formatOneDecimal(abv)}% ABV`);
  }

  if (nonChillFiltered === true) {
    parts.push("Нестудено филтрирано");
  }

  if (parts.length === 0) {
    return undefined;
  }

  return parts.join(" • ");
}

function formatOneDecimal(value: number): string {
  return value.toFixed(1);
}

function formatPriceEur(price: number): string {
  return `${price.toFixed(2)} €`;
}

function authorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
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
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-space-sm py-1 text-body-sm text-on-surface">
                <Icon className="text-secondary" fontSize={16} name="percent" />
                5% отстъпка
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-space-sm py-1 text-body-sm text-on-surface">
                <Icon
                  className="text-primary"
                  fontSize={16}
                  name="featured_seasonal_and_gifts"
                />
                Безплатна клубна бутилка уиски
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-space-sm py-1 text-body-sm text-on-surface">
                <Icon
                  className="text-secondary"
                  fontSize={16}
                  name="verified"
                />
                Преференциален ранен достъп до нови бутилки
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-space-sm py-1 text-body-sm text-on-surface">
                <Icon className="text-primary" fontSize={16} name="stars" />
                Специални клубни оферти
              </span>
            </div>
          </div>
          <div className="flex justify-center lg:col-span-5">
            <button
              className="flex w-full cursor-pointer items-center justify-center gap-space-xs rounded-lg bg-primary px-space-xl py-3.5 text-label-md font-bold text-on-primary uppercase shadow-sm transition-colors hover:bg-primary-fixed sm:w-auto"
              type="button"
            >
              Стани клубен член
              <Icon fontSize={18} name="arrow_forward" />
            </button>
          </div>
        </div>
      </div>
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
        <div className="pointer-events-none absolute -top-20 -right-20 h-96 w-96 rounded-full bg-primary-container/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
          <h2
            className="mb-space-xs font-headline text-headline-lg text-on-surface md:text-headline-hero"
            id="finder-cta-heading"
          >
            Открий своето идеално уиски за под 60 секунди
          </h2>
          <p className="mb-space-xl max-w-2xl text-body-lg text-on-surface-variant">
            Трябват ни 5 кратки въпроса, относно вкусовия ви профил
          </p>
          <button
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary-container px-8 py-4 text-label-lg font-bold text-on-primary uppercase tracking-wider shadow-lg transition-all hover:scale-105 hover:bg-primary"
            type="button"
          >
            <span>открий вкусовия си профил</span>
            <Icon fontSize={18} name="arrow_forward" />
          </button>
        </div>
      </div>
    </section>
  );
}
