"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { buildCatalogueHref } from "@/app/catalogue/parse-catalogue-query";
import { Icon } from "@/components/icon";
import type { WhiskyPage, WhiskyPageSku } from "@/shop/types";
import { formatPriceEur } from "@/utils/format-price-eur";
import {
  formatAbvVol,
  formatColourFiltration,
  formatDisplayedScore,
  formatVolumeMl,
  formatWhiskyAgeYears,
  skuAvailabilityLabel,
  skuIsInStock,
} from "@/utils/whisky-page-labels";
import { youtubeVideoId } from "@/utils/youtube-video-id";

type WhiskyDetailViewProps = {
  page: WhiskyPage;
};

export function WhiskyDetailView({ page }: WhiskyDetailViewProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [selectedSkuId, setSelectedSkuId] = useState(page.defaultSkuId);
  const [quantity, setQuantity] = useState(1);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const selectedSku = useMemo(() => {
    const found = page.skus.find((sku) => sku.id === selectedSkuId);
    if (found) {
      return found;
    }
    return page.skus[0];
  }, [page.skus, selectedSkuId]);

  const lineTotal = selectedSku.priceEur * quantity;
  const houseScoreLabel = formatDisplayedScore(page.houseScore);
  const colourFiltration = formatColourFiltration(
    page.naturalColour,
    page.nonChillFiltered,
  );
  const inStock = skuIsInStock(selectedSku.action);
  const mainPhoto = page.photos[photoIndex];
  const videoId = youtubeVideoId(page.houseVideoUrl);

  function changeQuantity(delta: number) {
    setQuantity((current) => Math.max(1, current + delta));
  }

  return (
    <div className="flex w-full flex-col">
      <section className="w-full bg-surface-container-lowest py-space-sm">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-space-sm px-gutter-mobile md:px-gutter">
          <nav
            aria-label="Хлебни трохи"
            className="flex flex-wrap items-center gap-2 text-technical-data text-on-surface-variant"
          >
            <Link
              className="cursor-pointer transition-colors hover:text-primary"
              href="/"
            >
              Начало
            </Link>
            <span className="text-outline/40">/</span>
            <Link
              className="cursor-pointer transition-colors hover:text-primary"
              href="/catalogue"
            >
              Селекция
            </Link>
            <span className="text-outline/40">/</span>
            <Link
              className="cursor-pointer transition-colors hover:text-primary"
              href={buildCatalogueHref({}, { country: page.country })}
            >
              {page.country}
            </Link>
            {page.region ? (
              <>
                <span className="text-outline/40">/</span>
                <Link
                  className="cursor-pointer transition-colors hover:text-primary"
                  href={buildCatalogueHref({}, { region: page.region })}
                >
                  {page.region}
                </Link>
              </>
            ) : null}
            <span className="text-outline/40">/</span>
            <span className="font-semibold text-secondary">{page.name}</span>
          </nav>
        </div>
      </section>

      <section className="w-full bg-surface py-space-lg">
        <div className="mx-auto max-w-[1440px] px-gutter-mobile md:px-gutter">
          <div className="grid grid-cols-1 items-start gap-space-xl lg:grid-cols-12">
            <div className="flex flex-col gap-space-md lg:col-span-6">
              <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-surface-container-low p-space-lg shadow-xl">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,188,77,0.15),rgba(217,119,6,0.05),transparent)]" />
                <button
                  className="absolute top-4 right-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-surface-container-high/80 text-on-surface-variant shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:text-primary"
                  title="Любими"
                  type="button"
                >
                  <Icon fontSize={20} name="favorite" />
                </button>
                {mainPhoto ? (
                  <div className="relative z-10 flex h-[480px] w-full max-w-sm items-center justify-center py-4">
                    <Image
                      alt={page.name}
                      className="max-h-full max-w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] transition-all duration-300"
                      height={480}
                      src={mainPhoto.url}
                      unoptimized
                      width={320}
                    />
                  </div>
                ) : null}
              </div>

              {page.photos.length > 1 ? (
                <div className="grid grid-cols-4 gap-space-sm">
                  {page.photos.map((photo, index) => {
                    const isActive = index === photoIndex;
                    return (
                      <button
                        className={`relative flex cursor-pointer flex-col items-center gap-1 rounded-lg p-2 shadow-sm transition-all hover:bg-surface-container-high ${
                          isActive
                            ? "bg-surface-container-high"
                            : "bg-surface-container-low"
                        }`}
                        key={photo.url + String(index)}
                        onClick={() => setPhotoIndex(index)}
                        type="button"
                      >
                        <Image
                          alt={photo.caption ? photo.caption : page.name}
                          className="h-16 w-full object-contain"
                          height={64}
                          src={photo.url}
                          unoptimized
                          width={80}
                        />
                        {photo.caption ? (
                          <span
                            className={`text-label-sm ${isActive ? "text-on-surface" : "text-on-surface-variant"}`}
                          >
                            {photo.caption}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-space-md lg:col-span-6">
              {houseScoreLabel ? (
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-container/30 px-space-sm py-1 text-label-sm font-semibold text-tertiary">
                    <Icon fill fontSize={15} name="star" />
                    {houseScoreLabel}
                  </span>
                </div>
              ) : null}

              <div className="space-y-1">
                <h1 className="font-headline text-headline-lg leading-tight tracking-tight text-on-surface">
                  {page.name}
                </h1>
                {page.description ? (
                  <p className="text-body-md leading-relaxed text-on-surface-variant">
                    {page.description}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-space-xs pt-1 sm:grid-cols-4">
                <SpecChip label="Държава" value={page.country} />
                {page.region ? (
                  <SpecChip label="Регион" value={page.region} />
                ) : null}
                <SpecChip
                  label="Отлежаване"
                  value={formatWhiskyAgeYears(page.ageYears)}
                />
                <SpecChip label="Алкохол" value={formatAbvVol(page.abv)} />
                {colourFiltration ? (
                  <SpecChip
                    highlight
                    label="Цвят / Филтрация"
                    value={colourFiltration}
                  />
                ) : null}
              </div>

              {page.awards.length > 0 ? (
                <div className="space-y-space-xs pt-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-label-md uppercase tracking-wider text-secondary">
                      <Icon fill fontSize={16} name="workspace_premium" />
                      Отличия и международни награди
                    </span>
                    <span className="text-technical-data text-outline">
                      {page.awards.length} титли
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-space-xs sm:grid-cols-2">
                    {page.awards.map((award) => (
                      <div
                        className="flex items-start gap-2.5 rounded-lg bg-surface-container-low p-2.5 shadow-sm transition-colors hover:bg-surface-container-high"
                        key={`${award.title}-${award.year}`}
                      >
                        <Icon
                          className="mt-0.5 text-secondary"
                          fill
                          fontSize={22}
                          name="military_tech"
                        />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="mb-0.5 flex items-center justify-between gap-1">
                            <span className="truncate text-label-sm font-bold text-on-surface">
                              {award.title}
                            </span>
                            <span className="rounded border border-tertiary-container/40 bg-tertiary-container/30 px-1.5 py-0.5 text-[10px] font-label-sm leading-none font-bold text-tertiary">
                              {award.year}
                            </span>
                          </div>
                          <span className="text-technical-data leading-tight font-medium text-secondary">
                            {award.organisation}
                          </span>
                          <span className="mt-0.5 text-[11px] leading-tight text-outline">
                            Категория: {award.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {page.skus.length > 0 ? (
                <div className="space-y-space-xs pt-2">
                  <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
                    {page.skus.map((sku) => (
                      <SkuOptionCard
                        key={sku.id}
                        onSelect={() => setSelectedSkuId(sku.id)}
                        selected={sku.id === selectedSku.id}
                        sku={sku}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="space-y-space-md rounded-xl bg-surface-container-low p-space-md shadow-md">
                <div className="flex flex-col items-center gap-space-md sm:flex-row">
                  <div className="flex items-center rounded-lg bg-surface-container-lowest p-1">
                    <button
                      aria-label="Намали количеството"
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-surface-container-high"
                      onClick={() => changeQuantity(-1)}
                      type="button"
                    >
                      <Icon fontSize={18} name="remove" />
                    </button>
                    <span className="w-12 text-center text-body-md font-bold text-on-surface">
                      {quantity}
                    </span>
                    <button
                      aria-label="Увеличи количеството"
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-surface-container-high"
                      onClick={() => changeQuantity(1)}
                      type="button"
                    >
                      <Icon fontSize={18} name="add" />
                    </button>
                  </div>

                  {inStock ? (
                    <>
                      <button
                        className="flex w-full flex-1 cursor-pointer transform items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container px-space-md py-3 text-label-lg uppercase tracking-wider text-on-primary-container shadow-[0_4px_20px_rgba(217,119,6,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(250,188,77,0.5)]"
                        type="button"
                      >
                        <Icon fontSize={20} name="shopping_bag" />
                        <span>
                          Добави в кошницата • {formatPriceEur(lineTotal)}
                        </span>
                      </button>
                      <button
                        className="w-full cursor-pointer rounded-lg bg-surface-container-high px-space-lg py-3 text-label-lg uppercase tracking-wider text-primary transition-all hover:bg-surface-bright sm:w-auto"
                        type="button"
                      >
                        Купи сега
                      </button>
                    </>
                  ) : (
                    <button
                      className="flex w-full flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline-variant bg-transparent px-space-md py-3 text-label-lg uppercase tracking-wider text-on-surface transition-colors hover:border-secondary hover:bg-surface-container"
                      type="button"
                    >
                      <Icon fontSize={20} name="mail" />
                      <span>Попитай ни</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs text-technical-data text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <Icon
                      className="text-secondary"
                      fontSize={18}
                      name="schedule"
                    />
                    <span>
                      Поръчай до{" "}
                      <strong className="font-semibold text-on-surface">
                        16:00 ч.
                      </strong>{" "}
                      днес за{" "}
                      <strong className="font-semibold text-secondary">
                        утрешна доставка
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-label-sm text-secondary">
                    <Icon fontSize={16} name="local_shipping" />
                    <span>Експресна доставка със Спиди</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {page.houseVideoUrl ? (
        <section className="w-full bg-surface py-space-xl">
          <div className="mx-auto max-w-[1440px] px-gutter-mobile md:px-gutter">
            <div className="mx-auto mb-space-xl max-w-2xl text-center">
              <h2 className="mt-1 font-headline text-headline-lg tracking-tight text-on-surface">
                Ревю: {page.name}
              </h2>
              <p className="mt-2 text-body-md text-on-surface-variant">
                Гледайте подробния анализ, историята на дестилерията и
                дегустационните ни впечатления
              </p>
            </div>
            <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
              {videoPlaying && videoId ? (
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-surface-container-low shadow-2xl">
                  <iframe
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                    title={`Ревю: ${page.name}`}
                  />
                </div>
              ) : (
                <button
                  className="group relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-surface-container-low shadow-2xl"
                  onClick={() => setVideoPlaying(true)}
                  type="button"
                >
                  {mainPhoto ? (
                    <Image
                      alt={page.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      height={480}
                      src={mainPhoto.url}
                      unoptimized
                      width={854}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-surface-container-lowest/50 transition-colors group-hover:bg-surface-container-lowest/30" />
                  <span className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-on-primary shadow-[0_0_30px_rgba(250,188,77,0.6)] transition-transform group-hover:scale-110">
                    <Icon fill fontSize={36} name="play_arrow" />
                  </span>
                </button>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {page.tastings.length > 0 ? (
        <section className="w-full bg-surface-container-lowest py-space-lg">
          <div className="mx-auto max-w-[1440px] px-gutter-mobile md:px-gutter">
            <h2 className="mb-space-md font-headline text-headline-md text-on-surface">
              Дегустации от членове
            </h2>
            <ul className="space-y-space-md">
              {page.tastings.map((tasting) => {
                const tastingScore = formatDisplayedScore(tasting.score);
                return (
                  <li
                    className="rounded-xl bg-surface-container-low p-space-md shadow-sm"
                    key={`${tasting.authorName}-${tasting.text.slice(0, 24)}`}
                  >
                    <div className="mb-space-xs flex flex-wrap items-center gap-space-sm">
                      <span className="font-semibold text-on-surface">
                        {tasting.authorName}
                      </span>
                      {tasting.verifiedPurchase ? (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-label-sm text-primary">
                          Потвърдена покупка
                        </span>
                      ) : null}
                      {tastingScore ? (
                        <span className="text-technical-data text-secondary">
                          {tastingScore}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-body-md text-on-surface-variant">
                      {tasting.text}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}

      {page.pairings.length > 0 ? (
        <section className="w-full bg-surface py-space-xl">
          <div className="mx-auto max-w-[1440px] px-gutter-mobile md:px-gutter">
            <h2 className="mb-space-lg font-headline text-headline-lg tracking-tight text-on-surface">
              С какво се комбинира перфектно
            </h2>
            <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
              {page.pairings.map((pairing) => (
                <article
                  className="group flex flex-col overflow-hidden rounded-xl bg-surface-container-low shadow-md"
                  key={pairing.title}
                >
                  <div className="relative h-44 w-full overflow-hidden">
                    <Image
                      alt={pairing.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      height={176}
                      src={pairing.photoUrl}
                      unoptimized
                      width={320}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-space-md">
                    <div>
                      <span className="text-label-sm font-bold uppercase text-secondary">
                        {pairing.eyebrow}
                      </span>
                      <h3 className="mt-1 font-headline text-headline-sm text-on-surface">
                        {pairing.title}
                      </h3>
                      <p className="mt-2 text-body-sm text-on-surface-variant">
                        {pairing.body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {page.relatedSet ? (
        <section className="w-full bg-surface-container-lowest py-space-xl">
          <div className="mx-auto max-w-[1440px] px-gutter-mobile md:px-gutter">
            <div className="rounded-xl bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-low p-space-lg shadow-xl">
              <div className="grid grid-cols-1 items-center gap-space-lg lg:grid-cols-12">
                <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-surface-container-lowest p-space-md lg:col-span-4">
                  <Image
                    alt={page.relatedSet.title}
                    className="h-52 w-auto object-contain"
                    height={208}
                    src={page.relatedSet.photoUrl}
                    unoptimized
                    width={280}
                  />
                </div>
                <div className="space-y-2 lg:col-span-5">
                  <span className="text-label-sm font-bold uppercase tracking-widest text-secondary">
                    Често купувани заедно
                  </span>
                  <h3 className="font-headline text-headline-md text-on-surface">
                    {page.relatedSet.title}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">
                    {page.relatedSet.description}
                  </p>
                </div>
                <div className="flex flex-col items-start justify-center gap-space-sm lg:col-span-3 lg:items-end lg:text-right">
                  <div className="font-headline text-headline-md font-bold text-primary">
                    {formatPriceEur(page.relatedSet.priceEur)}
                  </div>
                  <button
                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-surface-container-high px-space-md py-2.5 text-label-md uppercase tracking-wider text-primary shadow-sm transition-all hover:bg-surface-bright hover:text-on-surface"
                    type="button"
                  >
                    <Icon fontSize={18} name="add_circle" />
                    <span>Добави сета към поръчката</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SpecChip({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col rounded-lg bg-surface-container-low p-space-sm">
      <span className="text-label-sm uppercase tracking-wider text-outline">
        {label}
      </span>
      <span
        className={`text-technical-data font-semibold ${highlight ? "text-primary" : "text-on-surface"}`}
      >
        {value}
      </span>
    </div>
  );
}

function SkuOptionCard({
  sku,
  selected,
  onSelect,
}: {
  sku: WhiskyPageSku;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`flex cursor-pointer flex-col justify-between rounded-xl p-space-md transition-all ${
        selected
          ? "bg-surface-container-high shadow-md"
          : "bg-surface-container-low shadow-sm hover:bg-surface-container-high"
      }`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-label-md font-bold uppercase tracking-wider text-on-surface">
          {formatVolumeMl(sku.volumeMl)}
        </span>
        <span
          className={`h-4 w-4 rounded-full ${selected ? "bg-primary" : "bg-surface-container-highest"}`}
        />
      </div>
      <div className="mt-space-sm flex items-baseline justify-between">
        <span className="font-headline text-headline-md font-bold text-primary">
          {formatPriceEur(sku.priceEur)}
        </span>
        <span className="text-label-sm uppercase text-outline">
          {skuAvailabilityLabel(sku.action)}
        </span>
      </div>
    </button>
  );
}
