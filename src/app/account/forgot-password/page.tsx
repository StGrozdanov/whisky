import type { Metadata } from "next";
import { DiscoveryPageLayout } from "@/components/discovery-page";
import { FormCard } from "@/components/form-card";
import { ForgotPasswordForm } from "../_components/forgot-password-form";

export const metadata: Metadata = {
  title: "Забравена парола",
};

export default function ForgotPasswordPage() {
  return (
    <DiscoveryPageLayout
      intro="Въведете имейла на акаунта си и ще ви изпратим линк за нова парола."
      title="Забравена парола"
    >
      <FormCard>
        <ForgotPasswordForm />
      </FormCard>
    </DiscoveryPageLayout>
  );
}
