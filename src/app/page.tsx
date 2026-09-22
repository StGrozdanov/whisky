import { getShop } from "@/shop/get-shop";
import { HomeView } from "./_components/home-view";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const shop = await getShop();
  const home = await shop.home();
  return <HomeView home={home} />;
}
