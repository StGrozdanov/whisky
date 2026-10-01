import Link from "next/link";
import { Icon } from "@/components/icon";

export default function WhiskyNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-[1440px] flex-col items-center justify-center gap-space-md px-gutter-mobile py-space-xl text-center md:px-gutter">
      <Icon className="text-outline" fontSize={32} name="inventory_2" />
      <h1 className="font-headline text-headline-md text-on-surface">
        Това уиски не е налично
      </h1>
      <p className="max-w-md text-body-md text-on-surface-variant">
        Страницата липсва или уискито все още не е публикувано в селекцията.
      </p>
      <Link
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-space-xl py-3.5 text-label-md font-bold text-on-primary uppercase tracking-wider shadow-sm transition-colors hover:bg-primary-fixed"
        href="/catalogue"
      >
        Към селекцията
      </Link>
    </div>
  );
}
