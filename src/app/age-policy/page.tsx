import type { Metadata } from "next";
import { PolicyPage, type PolicySection } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Възрастова политика",
  description:
    "Whisky Finder продава алкохолни напитки само на лица, навършили 18 години.",
};

const SECTIONS: PolicySection[] = [
  {
    heading: "Само за лица, навършили 18 години",
    paragraphs: [
      "Whisky Finder предлага алкохолни напитки и продава само на лица, навършили 18 години. При първото посещение ви молим да потвърдите възрастта си. Отговорът се пази във вашия браузър.",
      "С всяка поръчка потвърждавате, че сте навършили 18 години. Подарък може да бъде изпратен само на пълнолетен получател.",
    ],
  },
  {
    heading: "Отговорна консумация",
    paragraphs: [
      "Насърчаваме умерената и отговорна консумация. Не шофирайте след употреба на алкохол. Алкохолът не е подходящ за бременни жени.",
    ],
  },
];

export default function AgePolicyPage() {
  return (
    <PolicyPage
      href="/age-policy"
      intro="Продаваме алкохол само на пълнолетни."
      sections={SECTIONS}
      title="Възрастова политика"
    />
  );
}
