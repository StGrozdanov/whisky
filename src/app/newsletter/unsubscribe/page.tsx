import type { Metadata } from "next";
import { DiscoveryPageLayout } from "@/components/discovery-page";
import { FormStatus } from "@/components/form-status";
import { UnsubscribeForm } from "./_components/unsubscribe-form";

export const metadata: Metadata = {
  title: "Отписване от бюлетина",
  robots: { index: false, follow: false },
};

type UnsubscribePageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function UnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
  const { token } = await searchParams;
  const unsubscribeToken = typeof token === "string" ? token : "";

  return (
    <DiscoveryPageLayout
      intro="Потвърдете, че не искате да получавате повече нашия бюлетин."
      title="Отписване от бюлетина"
    >
      <div className="max-w-xl rounded-2xl bg-surface-container-low p-space-lg shadow-xl">
        {unsubscribeToken === "" ? (
          <FormStatus
            message="Линкът за отписване е непълен. Използвайте линка от последното ни писмо или пишете на info@whiskyfinder.bg."
            tone="error"
          />
        ) : (
          <UnsubscribeForm token={unsubscribeToken} />
        )}
      </div>
    </DiscoveryPageLayout>
  );
}
