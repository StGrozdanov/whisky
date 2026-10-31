/** Main navigation; the footer repeats it as Useful links. No About page. */
export const MAIN_NAVIGATION_LINKS = [
  { href: "/catalogue", label: "Селекция" },
  { href: "/gifts", label: "Подаръци" },
  { href: "/promotions", label: "Промоции" },
  { href: "/awards", label: "Награди" },
  { href: "/club", label: "Клуб" },
  { href: "/finder", label: "Finder" },
] as const;

/** Policy pages, linked from the footer and from each Policy page. */
export const POLICY_LINKS = [
  { href: "/terms", label: "Общи условия" },
  { href: "/privacy", label: "Политика за поверителност" },
  { href: "/cookies", label: "Политика за бисквитките" },
  { href: "/delivery-and-payment", label: "Доставка и плащане" },
  { href: "/withdrawal-and-returns", label: "Отказ и връщане" },
  { href: "/age-policy", label: "Възрастова политика" },
] as const;

export const SHOP_CONTACT = {
  phone: "0876473165",
  email: "info@whiskyfinder.bg",
} as const;

export function isCurrentPath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
