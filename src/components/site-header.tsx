import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full bg-surface/90 shadow-[0_4px_24px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <div className="mx-auto flex h-28 max-w-[1440px] flex-col justify-between px-gutter-mobile py-space-xs md:px-gutter">
        <div className="flex items-center justify-between text-technical-data text-on-surface-variant">
          <div className="flex flex-wrap items-center gap-space-xs">
            <span>
              Телефон за контакти:{" "}
              <a
                className="cursor-pointer font-semibold text-secondary hover:underline"
                href="tel:0876473165"
              >
                0876473165
              </a>
            </span>
            <span className="mx-1 text-outline">•</span>
            <span>
              Безплатна доставка за цялата страна при поръчки над 50,00 €
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <Link
              className="group flex cursor-pointer items-center gap-space-sm"
              href="/"
            >
              <Image
                alt="Whisky Finder"
                className="h-12 w-12 shrink-0 rounded-full object-contain shadow-md"
                height={48}
                src="/brand/emblem.png"
                width={48}
              />
              <span className="font-headline text-label-lg font-bold tracking-widest text-primary uppercase transition-colors group-hover:text-secondary">
                WHISKY FINDER
              </span>
            </Link>
            {/* Nav links omitted until Catalogue (#4) and later tickets exist */}
            <nav aria-label="Основна навигация" className="hidden xl:block" />
          </div>

          <div className="flex max-w-md flex-1 items-center justify-end gap-space-md">
            <div className="relative hidden w-full max-w-xs lg:block">
              <input
                aria-label="Търсене"
                className="w-full rounded-lg bg-surface-container-lowest py-1.5 pr-space-sm pl-space-md text-technical-data text-on-surface shadow-inner placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="Търси дестилерия, нотка..."
                readOnly
                type="search"
              />
            </div>

            <div className="flex items-center gap-space-sm">
              <button
                aria-label="Количка"
                className="cursor-pointer rounded-lg bg-surface-container-low px-space-sm py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                type="button"
              >
                Количка
              </button>
              <button
                aria-label="Акаунт"
                className="cursor-pointer rounded-lg bg-primary px-space-sm py-2 text-label-md font-semibold text-on-primary"
                type="button"
              >
                Акаунт
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
