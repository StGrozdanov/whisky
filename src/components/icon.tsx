export type IconName =
  | "phone_in_talk"
  | "mail"
  | "chevron_right"
  | "search"
  | "favorite"
  | "shopping_bag"
  | "person"
  | "percent"
  | "featured_seasonal_and_gifts"
  | "verified"
  | "arrow_forward"
  | "chat"
  | "send"
  | "local_shipping"
  | "play_arrow"
  | "star";

export type IconFontSize = 14 | 16 | 18 | 20 | 22 | 24 | 32;

type IconProps = {
  name: IconName;
  fontSize: IconFontSize;
  className?: string;
};

function iconClassName(className: string): string {
  if (className === "") {
    return "material-symbols-outlined";
  }
  return `material-symbols-outlined ${className}`;
}

export function Icon({ name, fontSize, className = "" }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={iconClassName(className)}
      style={{ fontSize }}
    >
      {name}
    </span>
  );
}
