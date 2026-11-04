import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DiscoveryPageLayout } from "@/components/discovery-page";
import { FormCard } from "@/components/form-card";
import { SignInForm } from "@/components/sign-in-form";
import { currentMember } from "@/identity/sessions";
import { signIn } from "../actions";

export const metadata: Metadata = {
  title: "Вход",
};

export default async function SignInPage() {
  if (await currentMember()) {
    redirect("/account");
  }

  return (
    <DiscoveryPageLayout title="Вход" intro="">
      <FormCard>
        <SignInForm action={signIn} label="Вход в акаунта" />
        <p className="flex flex-wrap gap-x-space-md gap-y-space-xs text-body-sm">
          <Link
            className="text-secondary underline hover:text-primary"
            href="/account/forgot-password"
          >
            Забравена парола
          </Link>
          <Link
            className="text-secondary underline hover:text-primary"
            href="/account/register"
          >
            Нямате акаунт? Регистрирайте се
          </Link>
        </p>
      </FormCard>
    </DiscoveryPageLayout>
  );
}
