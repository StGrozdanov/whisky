import Image from "next/image";
import Link from "next/link";

const POLICY_LINKS = [
  { href: "#", label: "Доставка и плащане" },
  { href: "#", label: "Общи условия" },
  { href: "#", label: "Защита на личните данни (GDPR)" },
  { href: "#", label: "Често задавани въпроси (ЧЗВ)" },
] as const;

export function SiteFooter() {
  return (
    <footer className="w-full bg-surface-container-lowest text-on-surface-variant">
      <div className="mx-auto max-w-[1440px] px-gutter-mobile pt-space-xl pb-space-lg md:px-gutter">
        <div className="mb-space-xl grid grid-cols-1 gap-space-xl md:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col space-y-space-md lg:col-span-4">
            <div className="flex items-center gap-space-sm">
              <Image
                alt="Whisky Finder"
                className="h-12 w-auto object-contain shadow-md"
                height={48}
                src="/brand/lockup.jpg"
                width={160}
              />
            </div>
            <p className="max-w-sm text-body-sm text-on-surface-variant">
              Селекция от уискита с гарантиран автентичен произход.
            </p>
            <Link
              className="cursor-pointer text-label-lg text-primary"
              href="/"
            >
              whiskyfinder.bg
            </Link>
          </div>

          <div className="lg:col-span-4">
            <h2 className="mb-space-md text-label-md text-secondary uppercase">
              Контакти
            </h2>
            <div className="space-y-space-sm text-body-sm">
              <div className="flex flex-col">
                <span className="text-technical-data text-outline">
                  Телефон
                </span>
                <a
                  className="mt-0.5 cursor-pointer text-secondary font-semibold hover:text-primary"
                  href="tel:0888888888"
                >
                  0888888888
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-technical-data text-outline">Имейл</span>
                <a
                  className="mt-0.5 cursor-pointer font-semibold text-on-surface hover:text-primary"
                  href="mailto:info@whiskyfinder.bg"
                >
                  info@whiskyfinder.bg
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <h2 className="mb-space-md text-label-md text-secondary uppercase">
              Информация и Политики
            </h2>
            <ul className="space-y-2 text-body-sm">
              {POLICY_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    className="cursor-pointer hover:text-primary"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-space-md border-t border-surface-container-highest/40 pt-space-md lg:flex-row">
          <span className="text-technical-data text-outline">
            © 2026 whiskyfinder.bg Всички права запазени.
          </span>
          <span className="text-technical-data text-on-surface-variant">
            Доставка със Спиди в цялата страна
          </span>
        </div>
      </div>
    </footer>
  );
}
