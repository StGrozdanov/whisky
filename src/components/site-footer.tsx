import Image from "next/image";
import Link from "next/link";
import { BrandIcon } from "@/components/brand-icon";
import { Icon } from "@/components/icon";
import { NewsletterSignup } from "@/components/newsletter-signup";
import {
  MAIN_NAVIGATION_LINKS,
  POLICY_LINKS,
  SHOP_CONTACT,
} from "@/components/site-links";

const SOCIAL_LINKS = [
  { label: "Facebook", icon: "facebook" },
  { label: "Instagram", icon: "instagram" },
  { label: "TikTok", icon: "tiktok" },
  { label: "YouTube", icon: "youtube" },
] as const;

const FOOTER_LINK_CLASS = "cursor-pointer transition-colors hover:text-primary";

export function SiteFooter() {
  return (
    <footer className="w-full bg-surface-container-lowest text-on-surface-variant">
      <div className="mx-auto max-w-[1440px] px-gutter-mobile pt-space-xl pb-space-lg md:px-gutter">
        <div className="mb-space-xl grid grid-cols-1 gap-space-xl md:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col justify-between space-y-space-md lg:col-span-3">
            <div className="space-y-space-sm">
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
                <span className="font-headline text-label-lg font-bold tracking-widest text-primary uppercase">
                  WHISKY FINDER
                </span>
              </Link>
              <p className="max-w-sm pt-1 text-body-sm text-on-surface-variant">
                Селекция от уискита с гарантиран автентичен произход.
              </p>
              <Link
                className="inline-flex cursor-pointer items-center gap-1 pt-1 text-label-md text-secondary transition-colors hover:text-primary"
                href="/about"
              >
                Повече за нас
                <Icon fontSize={16} name="arrow_forward" />
              </Link>
            </div>
            <div className="pt-space-xs">
              <span className="mb-2 block text-label-sm text-outline uppercase">
                Следвайте ни
              </span>
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map((link) => (
                  <button
                    aria-label={link.label}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant shadow-sm transition-colors hover:bg-surface-container-high hover:text-secondary"
                    key={link.label}
                    type="button"
                  >
                    <BrandIcon fontSize={18} name={link.icon} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-space-md lg:col-span-2">
            <h2 className="mb-space-md text-label-md text-secondary uppercase">
              Контакти
            </h2>
            <div className="space-y-space-sm text-body-sm">
              <div className="flex flex-col">
                <span className="text-technical-data text-outline">
                  Телефон
                </span>
                <a
                  className="group mt-0.5 cursor-pointer font-semibold"
                  href={`tel:${SHOP_CONTACT.phone}`}
                >
                  <span className="text-on-surface group-hover:text-primary">
                    {SHOP_CONTACT.phone}
                  </span>
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-technical-data text-outline">Имейл</span>
                <a
                  className="group mt-0.5 cursor-pointer font-semibold"
                  href={`mailto:${SHOP_CONTACT.email}`}
                >
                  <span className="text-on-surface group-hover:text-primary">
                    {SHOP_CONTACT.email}
                  </span>
                </a>
              </div>
              <div className="pt-2">
                <Link
                  className="group inline-flex cursor-pointer items-center gap-2 text-body-sm text-on-surface-variant transition-colors hover:text-primary"
                  href="/contacts"
                >
                  <Icon
                    className="text-secondary group-hover:text-primary"
                    fontSize={18}
                    name="chat"
                  />
                  Форма за контакти
                </Link>
              </div>
            </div>
          </div>

          <nav
            aria-labelledby="footer-useful-links-heading"
            className="flex flex-col space-y-space-md lg:col-span-2"
          >
            <h2
              className="mb-space-md text-label-md text-secondary uppercase"
              id="footer-useful-links-heading"
            >
              Полезни връзки
            </h2>
            <ul className="space-y-2 text-body-sm">
              {MAIN_NAVIGATION_LINKS.map((link) => (
                <li key={link.href}>
                  <Link className={FOOTER_LINK_CLASS} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-labelledby="footer-policies-heading"
            className="flex flex-col space-y-space-md lg:col-span-2"
          >
            <h2
              className="mb-space-md text-label-md text-secondary uppercase"
              id="footer-policies-heading"
            >
              Информация и Политики
            </h2>
            <ul className="space-y-2 text-body-sm">
              {POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link className={FOOTER_LINK_CLASS} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col space-y-space-sm lg:col-span-3">
            <h2 className="mb-space-md text-label-md text-secondary uppercase">
              Абонирай се за нашия бюлетин
            </h2>
            <p className="mb-space-sm text-body-sm text-on-surface-variant/80">
              Получавай първи достъп до лимитирани бъчви, отворени сесии и
              дегустационни вечери.
            </p>
            <NewsletterSignup />
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-space-md border-t border-surface-container-highest/40 pt-space-md lg:flex-row">
          <span className="text-technical-data text-outline">
            © 2026 whiskyfinder.bg Всички права запазени.
          </span>
          <span className="flex items-center gap-1.5 text-technical-data text-on-surface-variant">
            <Icon
              className="text-secondary"
              fontSize={16}
              name="local_shipping"
            />
            Доставка със Спиди в цялата страна
          </span>
        </div>
      </div>
    </footer>
  );
}
