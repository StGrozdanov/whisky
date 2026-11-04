import type { Metadata } from "next";
import Link from "next/link";
import { DiscoveryPageLayout } from "@/components/discovery-page";
import { FormCard } from "@/components/form-card";
import { FormStatus } from "@/components/form-status";
import { ResetPasswordForm } from "../_components/reset-password-form";

export const metadata: Metadata = {
  title: "Нова парола",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token_hash?: string | string[] }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token_hash: tokenHash } = await searchParams;
  const token = typeof tokenHash === "string" ? tokenHash : "";

  return (
    <DiscoveryPageLayout
      intro="Изберете нова парола за акаунта си."
      title="Нова парола"
    >
      <FormCard>
        {token === "" ? (
          <>
            <FormStatus
              message="Линкът за нова парола е непълен. Използвайте линка от писмото ни."
              tone="error"
            />
            <Link
              className="text-body-sm text-secondary underline hover:text-primary"
              href="/account/forgot-password"
            >
              Поискайте нов линк
            </Link>
          </>
        ) : (
          <ResetPasswordForm token={token} />
        )}
      </FormCard>
    </DiscoveryPageLayout>
  );
}
