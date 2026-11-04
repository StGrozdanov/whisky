import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DiscoveryPageLayout } from "@/components/discovery-page";
import { FormCard } from "@/components/form-card";
import { currentMember } from "@/identity/sessions";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Моят акаунт",
};

export default async function AccountPage() {
  const member = await currentMember();
  if (!member) {
    redirect("/account/sign-in");
  }

  return (
    <DiscoveryPageLayout
      intro="Данните, с които сте влезли в Whisky Finder."
      title="Моят акаунт"
    >
      <FormCard>
        <dl className="grid grid-cols-[auto_1fr] gap-x-space-md gap-y-space-xs text-body-md">
          <dt className="text-on-surface-variant">Име</dt>
          <dd className="text-on-surface">
            {member.firstName} {member.lastName}
          </dd>
          <dt className="text-on-surface-variant">Имейл</dt>
          <dd className="break-all text-on-surface">{member.email}</dd>
        </dl>
        <form action={signOut}>
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
