"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Children, isValidElement, type ReactNode, useCallback } from "react";
import { Icon, type IconName } from "@/components/icon";

export type HomeRailSlideBasis = "quarter" | "half";

export type HomeRailEyebrow = {
  label: string;
  icon: IconName;
  className: string;
};

type HomeRailCarouselProps = {
  headingId: string;
  eyebrow?: HomeRailEyebrow;
  title: string;
  prevLabel: string;
  nextLabel: string;
  slideBasis: HomeRailSlideBasis;
  children: ReactNode;
};

const SLIDE_BASIS_CLASS: Record<HomeRailSlideBasis, string> = {
  quarter:
    "flex h-full min-w-0 shrink-0 grow-0 basis-full sm:basis-[calc((100%-var(--spacing-space-md))/2)] lg:basis-[calc((100%-(var(--spacing-space-md)*3))/4)]",
  half: "flex h-full min-w-0 shrink-0 grow-0 basis-full lg:basis-[calc((100%-var(--spacing-space-xl))/2)]",
};

const SLIDE_GAP_CLASS: Record<HomeRailSlideBasis, string> = {
  quarter: "flex items-stretch gap-space-md",
  half: "flex items-stretch gap-space-xl",
};

export function HomeRailCarousel({
  headingId,
  eyebrow,
  title,
  prevLabel,
  nextLabel,
  slideBasis,
  children,
}: HomeRailCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

  const slideClassName = SLIDE_BASIS_CLASS[slideBasis];
  const slides = Children.toArray(children);

  return (
    <section aria-labelledby={headingId} className="w-full">
      <div className="mb-space-lg flex items-end justify-between">
        <div className="flex flex-col gap-1">
          {eyebrow ? (
            <div
              className={`inline-flex items-center gap-1 ${eyebrow.className}`}
            >
              <Icon fontSize={16} name={eyebrow.icon} />
              <span className="text-label-sm font-bold tracking-widest uppercase">
                {eyebrow.label}
              </span>
            </div>
          ) : null}
          <h2
            className="font-headline text-headline-lg text-on-surface"
            id={headingId}
          >
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label={prevLabel}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high"
            onClick={scrollPrev}
            type="button"
          >
            <Icon fontSize={20} name="chevron_left" />
          </button>
          <button
            aria-label={nextLabel}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high"
            onClick={scrollNext}
            type="button"
          >
            <Icon fontSize={20} name="chevron_right" />
          </button>
        </div>
      </div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className={SLIDE_GAP_CLASS[slideBasis]}>
          {slides.map((slide) => {
            if (!isValidElement(slide) || slide.key === null) {
              return null;
            }
            return (
              <div className={slideClassName} key={slide.key}>
                {slide}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
