import Image from "next/image";
import { MenuSwitch } from "./MenuSwitch";

/** The printed menu's cover drawing — sun, vase and sprig. */
const COVER = { src: "/assets/menu/art-cover.png", width: 512, height: 588 };

/**
 * The top of both menu pages: the word, the switch, the cover drawing.
 *
 * Lives in the /menu layout, so it is rendered once and stays put while the
 * card under it changes from food to bar. That is what lets the Food | Bar
 * switch slide rather than remount.
 *
 * Every piece carries `data-masthead-item` for the first-view entrance; the
 * drawing also carries `data-critical`, which the loader waits on.
 */
export function MenuMasthead() {
  return (
    <header className="mx-auto max-w-4xl px-5 pt-28 md:px-8 md:pt-36">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1
            data-masthead-item
            className="font-display text-[4rem] leading-none font-medium text-menu-red md:text-[6rem]"
          >
            Menu
          </h1>
          <MenuSwitch variant="masthead" />
        </div>
        <figure data-masthead-item data-critical aria-hidden="true" className="w-24 shrink-0 md:w-44">
          <Image
            src={COVER.src}
            alt=""
            width={COVER.width}
            height={COVER.height}
            priority
            fetchPriority="high"
            sizes="(min-width: 768px) 176px, 96px"
            className="h-auto w-full"
          />
        </figure>
      </div>
    </header>
  );
}
