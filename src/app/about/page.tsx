import type { Metadata } from "next";
import Link from "next/link";
import { DiscoveryPageLayout } from "@/components/discovery-page";
import { Icon, type IconName } from "@/components/icon";
import { SHOP_CONTACT } from "@/shop/shop-contact";

export const metadata: Metadata = {
  title: "За нас",
  description:
    "Whisky Finder е малък български магазин за уиски с кратка подбрана селекция, собствени видео ревюта и персонален Finder.",
};

type Principle = {
  icon: IconName;
  title: string;
  text: string;
};

const PRINCIPLES: Principle[] = [
  {
    icon: "verified",
    title: "Кратка селекция",
    text: "Не продаваме всичко. Подбираме бутилки, които сме опитали и които можем да препоръчаме с чиста съвест.",
  },
  {
    icon: "play_arrow",
    title: "Собствени ревюта",
    text: "За много от уискитата сме записали видео ревю. Ще го намерите на страницата на съответното уиски.",
  },
  {
    icon: "stars",
    title: "Честни препоръки",
    text: "Препоръките и оценките ни са редакционни. Не показваме измислени продукти или наличности.",
  },
];

export default function AboutPage() {
  return (
    <DiscoveryPageLayout
      intro="Малък български магазин за уиски за любопитни начинаещи и хора, които знаят какво търсят."
      title="За нас"
    >
      <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-12">
        <article className="space-y-space-md lg:col-span-7">
          <h2 className="font-headline text-headline-md text-on-surface">
            Нашата история
          </h2>
          <p className="text-body-lg text-on-surface-variant">
            Whisky Finder започна от прост въпрос, който чувахме отново и
            отново: „Кое уиски да опитам?“. Вместо безкраен каталог предлагаме
            кратка селекция от Шотландия, Ирландия, САЩ и Япония, подредена
            така, че да можете да сравните и да изберете уверено.
          </p>
          <p className="text-body-lg text-on-surface-variant">
            Опитваме, снимаме и пишем за бутилките, които предлагаме. Нашата
            препоръка на началната страница е уискито, за което в момента имаме
            какво да разкажем, а Finder ви помага да откриете своя вкус с пет
            кратки въпроса.
          </p>
          <ul className="grid grid-cols-1 gap-space-md pt-space-sm sm:grid-cols-3">
            {PRINCIPLES.map((principle) => (
              <li
                className="rounded-xl bg-surface-container-low p-space-md shadow-md"
                key={principle.title}
              >
                <Icon
                  className="mb-space-xs text-secondary"
                  fontSize={24}
                  name={principle.icon}
                />
                <h3 className="mb-1 font-headline text-headline-sm text-on-surface">
                  {principle.title}
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  {principle.text}
                </p>
              </li>
            ))}
          </ul>
          <Link
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-space-xl py-3 text-label-md font-bold tracking-wider text-on-primary uppercase transition-colors hover:bg-primary-fixed"
            href="/catalogue"
          >
            Разгледай селекцията
            <Icon fontSize={16} name="arrow_forward" />
          </Link>
        </article>

        <aside
          aria-labelledby="about-contact-heading"
          className="h-fit space-y-space-sm rounded-2xl bg-surface-container-low p-space-lg lg:col-span-5"
        >
          <h2
            className="font-headline text-headline-sm text-on-surface"
            id="about-contact-heading"
          >
            Свържете се с нас
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Телефон:{" "}
            <a
              className="font-semibold text-on-surface hover:text-primary"
              href={`tel:${SHOP_CONTACT.phone}`}
            >
              {SHOP_CONTACT.phone}
            </a>
          </p>
          <p className="text-body-md text-on-surface-variant">
            Имейл:{" "}
            <a
              className="font-semibold text-on-surface hover:text-primary"
              href={`mailto:${SHOP_CONTACT.email}`}
            >
              {SHOP_CONTACT.email}
            </a>
          </p>
          <Link
            className="inline-flex items-center gap-1 text-label-md text-secondary hover:text-primary"
            href="/contacts"
          >
            Форма за контакти
            <Icon fontSize={16} name="arrow_forward" />
          </Link>
        </aside>
      </div>
    </DiscoveryPageLayout>
  );
}
