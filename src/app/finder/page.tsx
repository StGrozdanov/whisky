import type { Metadata } from "next";
import { DiscoveryPageLayout } from "@/components/discovery-page";
import { FinderFlow } from "./_components/finder-flow";

// Live OpenRouter research runs in this route's server action.
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Finder",
};

export default function FinderPage() {
  return (
    <DiscoveryPageLayout
      intro="Пет кратки въпроса за вкуса ви. При всяко търсене проучваме актуални публични източници и препоръчваме уиски само от нашата селекция."
      title="Открий своето уиски"
    >
      <div className="max-w-5xl">
        <FinderFlow />
      </div>
    </DiscoveryPageLayout>
  );
}
