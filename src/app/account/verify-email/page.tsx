import type { Metadata } from "next";
import { DiscoveryPageLayout } from "@/components/discovery-page";
import { FormCard } from "@/components/form-card";
import { FormStatus } from "@/components/form-status";
import { VerifyEmailForm } from "../_components/verify-email-form";

export const metadata: Metadata = {
  title: "Потвърждение на имейл",
};

type VerifyEmailPageProps = {
  searchParams: Promise<{ token_hash?: string | string[] }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token_hash: tokenHash } = await searchParams;
  const token = typeof tokenHash === "string" ? tokenHash : "";

  return (
    <DiscoveryPageLayout
      intro="Потвърдете имейла си, за да активирате акаунта."
      title="Потвърждение на имейл"
    >
      <FormCard>
        {token === "" ? (
          <FormStatus
            message="Линкът за потвърждение е непълен. Използвайте линка от писмото ни."
            tone="error"
          />
        ) : (
          <VerifyEmailForm token={token} />
        )}
      </FormCard>
    </DiscoveryPageLayout>
  );
}
