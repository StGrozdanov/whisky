import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";

export function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full bg-surface/90 shadow-[0_4px_24px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <div className="mx-auto flex h-28 max-w-[1440px] flex-col justify-between px-gutter-mobile py-space-xs md:px-gutter">
        <div className="flex items-center justify-between text-technical-data text-on-surface-variant">
          <div className="flex flex-wrap items-center gap-space-xs">
            <Icon
              className="text-secondary"
              fontSize={14}
              name="phone_in_talk"
            />
            <span>
              Телефон за контакти:{" "}
              <a
                className="cursor-pointer font-semibold text-secondary hover:underline"
                href="tel:0888888888"
              >
                0888888888
              </a>
            </span>
            <span className="mx-1 text-outline">•</span>
            <span>
              Безплатна доставка за цялата страна при поръчки над 50,00 €
            </span>
          </div>
          <Link
            className="flex cursor-pointer items-center gap-1 text-label-sm text-secondary transition-colors hover:text-primary"
            href="/contacts"
          >
            <Icon fontSize={14} name="mail" />
            <span>Запитване за наличност</span>
            <Icon fontSize={14} name="chevron_right" />
          </Link>
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
              <Icon
                className="pointer-events-none absolute top-1/2 left-space-sm -translate-y-1/2 text-outline"
                fontSize={18}
                name="search"
              />
              <input
                aria-label="Търсене"
                className="w-full rounded-lg bg-surface-container-lowest py-1.5 pr-space-sm pl-9 text-technical-data text-on-surface shadow-inner placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="Търси дестилерия, нотка..."
                readOnly
                type="search"
              />
            </div>

            <div className="flex items-center gap-space-sm">
              <button
                aria-label="Любими"
                className="cursor-pointer rounded-lg bg-surface-container-low p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                type="button"
              >
                <Icon fontSize={20} name="favorite" />
              </button>
              <button
                aria-label="Количка"
                className="cursor-pointer rounded-lg bg-surface-container-low p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                type="button"
              >
                <Icon fontSize={20} name="shopping_bag" />
              </button>
              <button
                aria-label="Акаунт"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-on-primary"
                type="button"
              >
                <Icon fontSize={18} name="person" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
