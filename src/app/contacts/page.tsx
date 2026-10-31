import type { Metadata } from "next";
import Link from "next/link";
import { DiscoveryPageLayout } from "@/components/discovery-page";
import { Icon } from "@/components/icon";
import { SHOP_CONTACT } from "@/shop/shop-contact";
import { ContactForm } from "./_components/contact-form";

export const metadata: Metadata = {
  title: "Контакти",
  description:
    "Свържете се с Whisky Finder по телефон, имейл или чрез формата за контакти.",
};

export default function ContactsPage() {
  return (
    <DiscoveryPageLayout
      intro="Пишете ни за въпрос, препоръка или заявление за отказ от поръчка. Отговаряме лично."
      title="Контакти"
    >
      <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-12">
        <section
          aria-labelledby="contact-form-heading"
          className="rounded-2xl bg-surface-container-low p-space-lg shadow-xl lg:col-span-8"
        >
          <h2
            className="mb-space-md font-headline text-headline-md text-on-surface"
            id="contact-form-heading"
          >
            Изпратете ни съобщение
          </h2>
          <ContactForm />
        </section>

        <aside
          aria-labelledby="contact-details-heading"
          className="h-fit space-y-space-md rounded-2xl bg-surface-container-low p-space-lg lg:col-span-4"
        >
          <h2
            className="font-headline text-headline-sm text-on-surface"
            id="contact-details-heading"
          >
            Директна връзка
          </h2>
          <p className="flex items-center gap-2 text-body-md">
            <Icon className="text-secondary" fontSize={20} name="phone" />
            <a
              className="font-semibold text-on-surface hover:text-primary"
              href={`tel:${SHOP_CONTACT.phone}`}
            >
              {SHOP_CONTACT.phone}
            </a>
          </p>
          <p className="flex items-center gap-2 text-body-md">
            <Icon className="text-secondary" fontSize={20} name="mail" />
            <a
              className="font-semibold text-on-surface hover:text-primary"
              href={`mailto:${SHOP_CONTACT.email}`}
            >
              {SHOP_CONTACT.email}
            </a>
          </p>
          <p className="text-body-sm text-on-surface-variant">
            Търсите размер, който не е в наличност? Използвайте „Попитай ни“ на
            страницата на уискито — ще ви пишем веднъж, когато е отново в
            наличност.
          </p>
          <p className="text-body-sm text-on-surface-variant">
            За отказ от поръчка вижте{" "}
            <Link
              className="text-secondary underline hover:text-primary"
              href="/withdrawal-and-returns"
            >
              Отказ и връщане
            </Link>
            .
          </p>
        </aside>
      </div>
    </DiscoveryPageLayout>
  );
}
