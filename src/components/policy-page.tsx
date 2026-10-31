import Link from "next/link";
import { DiscoveryPageLayout } from "@/components/discovery-page";
import { POLICY_LINKS, SHOP_CONTACT } from "@/components/site-links";
import { POLICIES_UPDATED_LABEL } from "@/utils/policy-versions";

export type PolicySection = {
  heading: string;
  paragraphs: string[];
  items?: string[];
};

type PolicyPageProps = {
  href: (typeof POLICY_LINKS)[number]["href"];
  title: string;
  intro: string;
  sections: PolicySection[];
};

export function PolicyPage({ href, title, intro, sections }: PolicyPageProps) {
  return (
    <DiscoveryPageLayout intro={intro} title={title}>
      <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-12">
        <article className="space-y-space-lg lg:col-span-8">
          <p className="text-technical-data text-outline">
            Последна актуализация: {POLICIES_UPDATED_LABEL}
          </p>
          {sections.map((section) => (
            <section className="space-y-space-sm" key={section.heading}>
              <h2 className="font-headline text-headline-sm text-on-surface">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  className="text-body-md text-on-surface-variant"
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
              {section.items ? (
                <ul className="list-disc space-y-1 pl-space-lg text-body-md text-on-surface-variant">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
          <section className="space-y-space-sm">
            <h2 className="font-headline text-headline-sm text-on-surface">
              Връзка с нас
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Whisky Finder, whiskyfinder.bg. Телефон:{" "}
              <a
                className="text-secondary underline hover:text-primary"
                href={`tel:${SHOP_CONTACT.phone}`}
              >
                {SHOP_CONTACT.phone}
              </a>
              , имейл:{" "}
              <a
                className="text-secondary underline hover:text-primary"
                href={`mailto:${SHOP_CONTACT.email}`}
              >
                {SHOP_CONTACT.email}
              </a>
              , или чрез{" "}
              <Link
                className="text-secondary underline hover:text-primary"
                href="/contacts"
              >
                формата за контакти
              </Link>
              .
            </p>
          </section>
        </article>

        <nav
          aria-label="Всички политики"
          className="h-fit rounded-xl bg-surface-container-low p-space-md lg:col-span-4"
        >
          <h2 className="mb-space-sm text-label-md text-secondary uppercase">
            Политики
          </h2>
          <ul className="space-y-2 text-body-sm">
            {POLICY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  aria-current={link.href === href ? "page" : undefined}
                  className={
                    link.href === href
                      ? "font-semibold text-primary"
                      : "text-on-surface-variant transition-colors hover:text-primary"
                  }
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </DiscoveryPageLayout>
  );
}
