"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";

export function SiteHeader() {
  const pathname = usePathname();
  const catalogueCurrent =
    pathname === "/catalogue" || pathname.startsWith("/catalogue/");

  return (
    <header className="fixed top-0 z-50 w-full shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="border-b border-secondary/25 bg-surface-container-lowest">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-space-md px-gutter-mobile py-2.5 text-body-md text-on-surface-variant md:px-gutter">
          <div className="flex flex-wrap items-center gap-space-xs">
            <Icon
              className="text-secondary"
              fontSize={20}
              name="phone_in_talk"
            />
            <span>
              Телефон за контакти:{" "}
              <a
                className="cursor-pointer font-semibold hover:underline"
                href="tel:0888888888"
              >
                <span className="text-secondary">0888888888</span>
              </a>
            </span>
            <span className="mx-1 text-outline">•</span>
            <span>
              Безплатна доставка за цялата страна при поръчки над 50,00 €
            </span>
          </div>
          <Link
            className="group flex shrink-0 cursor-pointer items-center gap-1 text-label-md transition-colors"
            href="/contacts"
          >
            <span className="inline-flex items-center gap-1 text-secondary group-hover:text-primary">
              <Icon fontSize={20} name="mail" />
              <span>Запитване за наличност</span>
              <Icon fontSize={20} name="chevron_right" />
            </span>
          </Link>
        </div>
      </div>

      <div className="bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-space-md px-gutter-mobile py-space-sm md:px-gutter">
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
              <span className="hidden font-headline text-label-lg font-bold tracking-widest text-primary uppercase transition-colors group-hover:text-secondary sm:inline">
                WHISKY FINDER
              </span>
            </Link>
            <nav
              aria-label="Основна навигация"
              className="ml-space-sm flex items-center gap-space-md sm:ml-space-md"
            >
              <Link
                aria-current={catalogueCurrent ? "page" : undefined}
                className={
                  catalogueCurrent
                    ? "cursor-pointer text-label-md font-bold tracking-wider text-primary uppercase"
                    : "cursor-pointer text-label-md tracking-wider text-on-surface-variant uppercase transition-colors hover:text-on-surface"
                }
                href="/catalogue"
              >
                Селекция
              </Link>
            </nav>
          </div>

          <div className="flex max-w-md flex-1 items-center justify-end gap-space-md">
            <div className="relative hidden w-full max-w-xs lg:block">
              <Icon
                className="pointer-events-none absolute top-1/2 left-space-sm -translate-y-1/2 text-outline"
                fontSize={22}
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
                <Icon fontSize={24} name="favorite" />
              </button>
              <button
                aria-label="Количка"
                className="cursor-pointer rounded-lg bg-surface-container-low p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                type="button"
              >
                <Icon fontSize={24} name="shopping_bag" />
              </button>
              <button
                aria-label="Акаунт"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-on-primary"
                type="button"
              >
                <Icon fontSize={22} name="person" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
