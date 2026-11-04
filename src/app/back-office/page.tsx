import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DiscoveryPageLayout } from "@/components/discovery-page";
import { FormCard } from "@/components/form-card";
import { currentShopkeeper } from "@/identity/sessions";
import { signOutShopkeeper } from "./actions";

export const metadata: Metadata = {
  title: "Бек офис",
};

export default async function BackOfficePage() {
  const shopkeeper = await currentShopkeeper();
  if (!shopkeeper) {
    redirect("/back-office/sign-in");
  }

  return (
    <DiscoveryPageLayout title="Бек офис">
      <FormCard>
        <p className="text-body-md text-on-surface-variant">
          Влезли сте като{" "}
          <span className="break-all text-on-surface">{shopkeeper.email}</span>.
        </p>
        <form action={signOutShopkeeper}>
          <button
            className="cursor-pointer rounded-lg border border-outline-variant/40 px-space-lg py-2.5 text-label-md tracking-wider text-on-surface uppercase transition-colors hover:border-primary hover:text-primary"
            type="submit"
          >
            Изход
          </button>
        </form>
      </FormCard>
    </DiscoveryPageLayout>
  );
}
