import type { Metadata } from "next";
import Link from "next/link";
import { DiscoveryPageLayout } from "@/components/discovery-page";
import { FormCard } from "@/components/form-card";
import { RegistrationForm } from "../_components/registration-form";

export const metadata: Metadata = {
  title: "Регистрация",
};

export default function RegisterPage() {
  return (
    <DiscoveryPageLayout
      intro="Акаунтът е по желание: можете да поръчате и без него."
      title="Регистрация"
    >
      <FormCard>
        <RegistrationForm />
        <p className="text-body-sm">
          <Link
            className="text-secondary underline hover:text-primary"
            href="/account/sign-in"
          >
            Вече имате акаунт? Влезте
          </Link>
        </p>
      </FormCard>
    </DiscoveryPageLayout>
  );
}
