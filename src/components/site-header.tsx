"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { isCurrentPath, MAIN_NAVIGATION_LINKS } from "@/components/site-links";
import { SiteSearch } from "@/components/site-search";
import { SHOP_CONTACT } from "@/shop/shop-contact";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-50 w-full shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-space-md focus:py-2 focus:text-label-md focus:text-on-primary"
        href="#main-content"
      >
        Към съдържанието
      </a>
      <div className="border-b border-secondary/25 bg-surface-container-lowest">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-space-md px-gutter-mobile py-2.5 text-body-md text-on-surface-variant md:px-gutter">
          <div className="flex flex-wrap items-center gap-space-xs">
            <Icon
              className="text-secondary"
              fontSize={20}
              name="phone_in_talk"
            />
            <span>
              <span className="hidden sm:inline">Телефон за контакти: </span>
              <a
                className="cursor-pointer font-semibold hover:underline"
                href={`tel:${SHOP_CONTACT.phone}`}
              >
                <span className="text-secondary">{SHOP_CONTACT.phone}</span>
              </a>
            </span>
            <span className="mx-1 hidden text-outline lg:inline">•</span>
            <span className="hidden lg:inline">
              Доставка със Спиди до адрес или офис в цялата страна
            </span>
          </div>
          <Link
            className="group flex shrink-0 cursor-pointer items-center gap-1 text-label-md transition-colors"
            href="/contacts"
          >
            <span className="inline-flex items-center gap-1 text-secondary group-hover:text-primary">
              <Icon fontSize={20} name="mail" />
              <span>Свържете се с нас</span>
              <Icon fontSize={20} name="chevron_right" />
            </span>
          </Link>
        </div>
      </div>

      <div className="bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-space-sm px-gutter-mobile py-space-sm md:gap-space-md md:px-gutter">
          <div className="flex min-w-0 items-center gap-space-md">
            <Link
              className="group flex shrink-0 cursor-pointer items-center gap-space-sm"
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
              className="ml-space-sm min-w-0 overflow-x-auto sm:ml-space-md"
            >
              <ul className="flex items-center gap-space-md whitespace-nowrap">
                {MAIN_NAVIGATION_LINKS.map((link) => {
                  const current = isCurrentPath(pathname, link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        aria-current={current ? "page" : undefined}
                        className={
                          current
                            ? "cursor-pointer text-label-md font-bold tracking-wider text-primary uppercase"
                            : "cursor-pointer text-label-md tracking-wider text-on-surface-variant uppercase transition-colors hover:text-on-surface"
                        }
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="flex w-full min-w-0 basis-full items-center justify-end gap-space-sm sm:gap-space-md lg:w-auto lg:max-w-md lg:flex-1">
            <div className="w-full min-w-0 max-w-xs">
              <SiteSearch />
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
