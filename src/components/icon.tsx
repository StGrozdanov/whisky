export type IconName =
  | "phone_in_talk"
  | "mail"
  | "chevron_right"
  | "chevron_left"
  | "search"
  | "favorite"
  | "favorite_border"
  | "shopping_bag"
  | "add_shopping_cart"
  | "person"
  | "percent"
  | "featured_seasonal_and_gifts"
  | "verified"
  | "stars"
  | "arrow_forward"
  | "chat"
  | "send"
  | "local_shipping"
  | "local_offer"
  | "fiber_new"
  | "play_arrow"
  | "star"
  | "close"
  | "sort_by_alpha"
  | "filter_alt_off"
  | "restart_alt"
  | "inventory_2"
  | "phone"
  | "cloud_off"
  | "refresh"
  | "remove"
  | "add"
  | "schedule"
  | "workspace_premium"
  | "military_tech"
  | "add_circle";

type IconFontSize = 14 | 15 | 16 | 18 | 20 | 22 | 24 | 32 | 36;

type IconProps = {
  name: IconName;
  fontSize: IconFontSize;
  className?: string;
  fill?: boolean;
};

function iconClassName(className: string): string {
  if (className === "") {
    return "material-symbols-outlined";
  }
  return `material-symbols-outlined ${className}`;
}

export function Icon({
  name,
  fontSize,
  className = "",
  fill = false,
}: IconProps) {
  const style: { fontSize: number; fontVariationSettings?: string } = {
    fontSize,
  };
  if (fill) {
    style.fontVariationSettings = "'FILL' 1";
  }

  return (
    <span aria-hidden="true" className={iconClassName(className)} style={style}>
      {name}
    </span>
  );
}
