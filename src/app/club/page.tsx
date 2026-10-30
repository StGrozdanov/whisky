import type { Metadata } from "next";
import { DiscoveryPageLayout } from "@/components/discovery-page";
import { Icon, type IconName } from "@/components/icon";
import { formatPriceEur } from "@/utils/format-price-eur";

export const metadata: Metadata = {
  title: "Клуб",
};

const CLUB_PRICE_EUR = 60;

type ClubBenefit = {
  icon: IconName;
  title: string;
  text: string;
};

const BENEFITS: ClubBenefit[] = [
  {
    icon: "percent",
    title: "5% клубна цена",
    text: "Автоматично 5% по-ниска цена от редовната. Когато уискито е в промоция, плащате по-ниската от двете цени — отстъпките не се събират.",
  },
  {
    icon: "featured_seasonal_and_gifts",
    title: "Безплатна клубна бутилка",
    text: "След потвърденото плащане ние избираме една бутилка и я изпращаме безплатно до адреса, посочен при покупката на членството.",
  },
  {
    icon: "stars",
    title: "Клубни оферти",
    text: "Специални предложения с ограничено количество и срок, видими само за активни членове.",
  },
  {
    icon: "verified",
    title: "Ранен достъп",
    text: "Някои нови уискита са първо достъпни за членовете на Клуба, преди да станат публични.",
  },
];

const TERMS = [
  "Членството е за 12 месеца от потвърденото плащане.",
  "Плаща се еднократно с карта и не се подновява автоматично.",
  "Ръчното подновяване на активно членство добавя нови 12 месеца.",
  "Изисква профил в Whisky Finder. След изтичане профилът, поръчките, любимите и дегустациите остават.",
];

export default function ClubPage() {
  return (
    <DiscoveryPageLayout
      intro="Годишно членство за хората, които пазаруват от нас редовно."
      title="Whisky Finder Клуб"
    >
      <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-12">
        <section
          aria-labelledby="club-benefits-heading"
          className="lg:col-span-7"
        >
          <h2
            className="mb-space-md font-headline text-headline-md text-on-surface"
            id="club-benefits-heading"
          >
            Какво включва
          </h2>
          <ul className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <li
                className="rounded-xl bg-surface-container-low p-space-md shadow-md"
                key={benefit.title}
              >
                <Icon
                  className="mb-space-xs text-secondary"
                  fontSize={24}
                  name={benefit.icon}
                />
                <h3 className="mb-1 font-headline text-headline-sm text-on-surface">
                  {benefit.title}
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  {benefit.text}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="club-terms-heading"
          className="h-fit rounded-2xl bg-surface-container-low p-space-lg shadow-xl lg:col-span-5"
        >
          <p className="font-headline text-headline-hero leading-none font-bold text-primary">
            {formatPriceEur(CLUB_PRICE_EUR)}
          </p>
          <p className="mb-space-md text-technical-data text-outline">
            за 12 месеца
          </p>
          <h2
            className="mb-space-sm font-headline text-headline-sm text-on-surface"
            id="club-terms-heading"
          >
            Условия
          </h2>
          <ul className="mb-space-md space-y-space-xs">
            {TERMS.map((term) => (
              <li
                className="flex items-start gap-2 text-body-sm text-on-surface-variant"
                key={term}
              >
                <Icon
                  className="mt-0.5 text-primary"
                  fontSize={16}
                  name="chevron_right"
                />
                <span>{term}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-lg bg-surface-container px-space-sm py-space-xs text-body-sm text-on-surface">
            Онлайн записването за Клуба предстои.
          </p>
        </section>
      </div>
    </DiscoveryPageLayout>
  );
}
