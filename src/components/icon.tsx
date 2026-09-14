"use client";

import type { SvgIconComponent } from "@mui/icons-material";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import CardGiftcardOutlined from "@mui/icons-material/CardGiftcardOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import MailOutlined from "@mui/icons-material/MailOutlined";
import PercentOutlined from "@mui/icons-material/PercentOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import PhoneInTalkOutlined from "@mui/icons-material/PhoneInTalkOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";

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
  | "arrow_forward";

export type IconFontSize = 14 | 16 | 18 | 20;

type IconProps = {
  name: IconName;
  fontSize: IconFontSize;
  className?: string;
};

// MUI 24×24 viewBox glyphs look smaller than Material Symbols at the same CSS px.
const OPTICAL_PX: Record<IconFontSize, number> = {
  14: 18,
  16: 20,
  18: 22,
  20: 24,
};

const ICONS: Record<IconName, SvgIconComponent> = {
  phone_in_talk: PhoneInTalkOutlined,
  mail: MailOutlined,
  chevron_right: ChevronRightOutlined,
  search: SearchOutlined,
  favorite: FavoriteBorderOutlined,
  shopping_bag: ShoppingBagOutlined,
  person: PersonOutlined,
  percent: PercentOutlined,
  featured_seasonal_and_gifts: CardGiftcardOutlined,
  verified: VerifiedOutlined,
  arrow_forward: ArrowForwardOutlined,
};

export function Icon({ name, fontSize, className = "" }: IconProps) {
  const SvgIcon = ICONS[name];
  const px = OPTICAL_PX[fontSize];

  return (
    <SvgIcon
      aria-hidden="true"
      className={className}
      style={{ fontSize: px, width: px, height: px }}
    />
  );
}
