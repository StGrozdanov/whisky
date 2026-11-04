import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DiscoveryPageLayout } from "@/components/discovery-page";
import { FormCard } from "@/components/form-card";
import { SignInForm } from "@/components/sign-in-form";
import { currentShopkeeper } from "@/identity/sessions";
import { signInShopkeeper } from "../actions";

export const metadata: Metadata = {
  title: "Вход в бек офиса",
};

export default async function BackOfficeSignInPage() {
  if (await currentShopkeeper()) {
    redirect("/back-office");
  }

  return (
    <DiscoveryPageLayout title="Вход в бек офиса">
      <FormCard>
        <SignInForm action={signInShopkeeper} label="Вход в бек офиса" />
      </FormCard>
    </DiscoveryPageLayout>
  );
}
