import { HomeView } from "@/home/home-view";
import { getShop } from "@/shop/get-shop";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const home = await getShop().home();
  return <HomeView home={home} />;
}
