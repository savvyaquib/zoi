import Image from "next/image";
import Link from "next/link";
import type { Diet, Menu, MenuGroup, MenuItem, MenuSection } from "@/data/menu-types";
import { SurfaceFlag } from "@/components/SurfaceFlag";
import { CategoryRail } from "./CategoryRail";
import { MenuReveal } from "./MenuReveal";

/**
 * Renders one menu — food or bar — as the printed one is laid out.
 *
 * Server component. Every item is real HTML in the initial response, which is
 * the entire reason the menu is a page and not a section: a crawler that reads
 * this once has the whole card, prices and all. The two client pieces are the
 * sticky rail and the reveal, and each is a leaf that attaches behaviour to
 * markup that is already here.
 *
 * ── Fidelity to the print ───────────────────────────────────────────────────
 *
 * Section headings in the display face, red, large — serif for food, script
 * for bar, as the two menus are. Sub-groups under a small red bold label with
 * the veg / non-veg square. Item names bold uppercase sans, price bold on the
 * same line, description in the regular weight beneath. Two columns from `md`
 * up, one on a phone. The boho illustration that sits beside each section on
 * the page sits beside it here; the three photographs that open Soups, Dim Sum
 * and Biryani open them here. Cream paper throughout.
 */

const TABS = [
  { id: "food", label: "Food", href: "/menu" },
  { id: "bar", label: "Bar", href: "/menu/bar" },
] as const;

function DietMark({ diet, className = "" }: { diet: Diet; className?: string }) {
  /*
    The Indian FSSAI mark — a green or red square with a dot — drawn as an
    inline SVG so it scales with the text and never ships as an image request.
    `aria-label` carries what the colour means.
  */
  const colour = diet === "veg" ? "#2e7d32" : "var(--menu-red)";
  return (
    <svg
      viewBox="0 0 12 12"
      width="11"
      height="11"
      role="img"
      aria-label={diet === "veg" ? "Vegetarian" : "Non-vegetarian"}
      className={`inline-block shrink-0 align-[-1px] ${className}`}
    >
      <rect x="0.75" y="0.75" width="10.5" height="10.5" fill="none" stroke={colour} strokeWidth="1.2" />
      <circle cx="6" cy="6" r="2.75" fill={colour} />
    </svg>
  );
}

function Price({ value }: { value: number }) {
  return <span className="tabular-nums">{value}</span>;
}

function Item({ item, priceLabels }: { item: MenuItem; priceLabels?: string[] }) {
  return (
    <li className="break-inside-avoid pb-5 md:pb-6">
      <div className="flex items-baseline justify-between gap-4">
        <h4 className="font-menu-sans text-[13.5px] leading-snug font-bold tracking-[0.02em] text-menu-ink uppercase md:text-sm">
          {item.diet && <DietMark diet={item.diet} className="mr-1.5" />}
          {item.name}
          {item.variants && (
            <span className="block text-[11px] font-semibold tracking-[0.06em] text-menu-ink/70">
              ({item.variants})
            </span>
          )}
        </h4>
        {item.prices ? (
          <span
            className="flex shrink-0 gap-2.5 font-menu-sans text-sm font-bold text-menu-ink"
            aria-label={
              priceLabels
                ? item.prices.map((p, i) => `${priceLabels[i] ?? ""} ${p}`).join(", ")
                : item.prices.join(" / ")
            }
          >
            {item.prices.map((p, i) => (
              <span key={i} className="min-w-[2.5ch] text-right">
                <Price value={p} />
              </span>
            ))}
          </span>
        ) : item.price !== undefined ? (
          <span className="shrink-0 font-menu-sans text-sm font-bold text-menu-ink">
            <Price value={item.price} />
          </span>
        ) : null}
      </div>
      {item.description && (
        <p className="mt-1 max-w-[46ch] font-menu-sans text-[12.5px] leading-[1.45] text-menu-ink/75 md:text-[13px]">
          {item.description}
        </p>
      )}
      {item.note && (
        <p className="mt-1 font-menu-sans text-[11px] font-semibold tracking-[0.06em] text-menu-ink/60 uppercase">
          {item.note}
        </p>
      )}
    </li>
  );
}

function Group({ group, script }: { group: MenuGroup; script: boolean }) {
  const hasLabel = Boolean(group.label);
  const hasPriceLabels = Boolean(group.priceLabels);
  return (
    <div className="mt-7 first:mt-6">
      {(hasLabel || hasPriceLabels) && (
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          {hasLabel && (
            <h3
              className={`font-menu-sans font-bold text-menu-red uppercase ${
                script ? "text-[13px] tracking-[0.1em]" : "text-sm tracking-[0.14em]"
              }`}
            >
              {group.label}
              {group.diet && <DietMark diet={group.diet} className="ml-2" />}
            </h3>
          )}
          {hasPriceLabels && (
            <span className="font-menu-sans text-[11px] font-semibold tracking-[0.1em] text-menu-ink/60 uppercase">
              {group.priceLabels!.join(" / ")}
            </span>
          )}
        </div>
      )}
      {/*
        CSS columns, not a grid: the print menu balances two columns of
        unequal-height entries, and `columns-2` is that exact behaviour with
        `break-inside-avoid` keeping each dish together. A grid would leave
        ragged holes wherever a description wraps.
      */}
      <ul className="gap-x-10 md:columns-2">
        {group.items.map((item) => (
          <Item key={item.name + (item.price ?? item.prices?.join())} item={item} priceLabels={group.priceLabels} />
        ))}
      </ul>
    </div>
  );
}

function Section({ section, script }: { section: MenuSection; script: boolean }) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-title`}
      data-reveal
      style={{ opacity: 0 }}
      /* scroll-mt clears the fixed band plus the rail, so a #hash landing
         puts the heading in view rather than under the chips. */
      className="relative scroll-mt-40 border-t border-menu-red/15 py-10 first:border-t-0 md:scroll-mt-44 md:py-14"
    >
      {section.photo && (
        <figure className="mb-9 overflow-hidden rounded-2xl md:mb-12">
          <Image
            src={section.photo.src}
            alt={section.photo.alt}
            width={section.photo.width}
            height={section.photo.height}
            sizes="(min-width: 1024px) 896px, 100vw"
            className="h-auto w-full object-cover md:max-h-[34rem]"
            loading="lazy"
          />
        </figure>
      )}

      <div className="md:grid md:grid-cols-[1fr_11rem] md:gap-10">
        <div>
          <h2
            id={`${section.id}-title`}
            className={`text-menu-red text-balance ${
              script
                ? "font-menu-script text-[2.75rem] leading-[0.95] font-semibold md:text-[3.5rem]"
                : "font-menu-display text-[2.25rem] leading-[1.05] font-medium md:text-[2.9rem]"
            }`}
          >
            {section.title}
          </h2>

          {section.groups.map((g, i) => (
            <Group key={g.label ?? i} group={g} script={script} />
          ))}
        </div>

        {section.art && (
          /*
            The illustration. On the page it sits in the outer margin beside
            the copy; here it takes the right-hand column from md up, and on a
            phone tucks in small at the end of the section — present, never
            in the way of the prices.
          */
          <figure
            aria-hidden="true"
            className="mt-6 flex justify-end md:mt-2 md:block md:justify-start md:pt-2"
          >
            <Image
              src={section.art.src}
              alt=""
              width={section.art.width}
              height={section.art.height}
              sizes="(min-width: 768px) 176px, 112px"
              /*
                Multiply. The crops carry their own cream ground, a shade off
                the paper texture behind them, and without this each one sits
                in a faint lighter rectangle. Multiplied, cream over cream is
                cream, and only the ink of the drawing lands on the page — the
                way it does in print.
              */
              className="h-auto w-28 mix-blend-multiply md:w-44"
              loading="lazy"
            />
          </figure>
        )}
      </div>
    </section>
  );
}

export function MenuPage({ menu }: { menu: Menu }) {
  const script = menu.id === "bar";
  const entries = menu.sections.map((s) => ({ id: s.id, title: s.title }));

  return (
    <main className="bg-menu-paper bg-[url('/assets/menu/paper.jpg')] bg-[length:342px_342px] bg-repeat text-menu-ink">
      <SurfaceFlag surface="paper" />
      <MenuReveal />

      {/*
        A paper band behind the fixed nav. Without it the menu scrolls straight
        through the 76px above the rail and headings show half-cut behind the
        hamburger. Fixed, under the nav (z-20 < z-50), blurred like the rail so
        the two read as one surface. Over the masthead's own padding when the
        page is at the top, so it is invisible until there is something to hide.
      */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-20 h-[4.75rem] bg-menu-paper/95 backdrop-blur-sm md:h-[5.75rem]"
      />

      {/* Masthead: the word Menu, then the two cards as tabs. */}
      <header className="mx-auto max-w-4xl px-5 pt-28 pb-2 md:px-8 md:pt-36">
        <h1 className="font-menu-display text-[4rem] leading-none font-medium text-menu-red md:text-[6rem]">
          Menu
        </h1>
        <nav aria-label="Menus" className="mt-6 flex gap-7 border-b border-menu-red/20">
          {TABS.map((t) => {
            const current = t.id === menu.id;
            return (
              <Link
                key={t.id}
                href={t.href}
                aria-current={current ? "page" : undefined}
                className={`-mb-px border-b-2 pb-3 font-menu-sans text-xs font-bold tracking-[0.18em] uppercase transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-menu-red focus-visible:outline-none ${
                  current
                    ? "border-menu-red text-menu-red"
                    : "border-transparent text-menu-ink/50 hover:text-menu-red"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/*
        The rail. Sticky beneath the fixed nav — 4.5rem clears the hamburger
        pill on a phone, 5.5rem on desktop — with the paper continuing behind
        it and a hairline so content scrolling under reads as under.
      */}
      <div
        data-rail-sticky
        className="sticky top-[4.75rem] z-30 border-b border-menu-red/15 bg-menu-paper/95 backdrop-blur-sm md:top-[5.75rem]"
      >
        <div className="mx-auto max-w-4xl">
          <CategoryRail entries={entries} />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 md:px-8">
        {menu.sections.map((s) => (
          <Section key={s.id} section={s} script={script} />
        ))}

        <footer className="border-t border-menu-red/15 py-10 md:py-14">
          <Image
            src={script ? "/assets/menu/swash-brown.jpg" : "/assets/menu/swash-red.png"}
            alt=""
            width={480}
            height={script ? 270 : 258}
            aria-hidden="true"
            className="mb-8 ml-auto h-auto w-28 mix-blend-multiply md:w-36"
            loading="lazy"
          />
          <p className="max-w-3xl font-menu-sans text-[11px] leading-relaxed text-menu-ink/60">
            {menu.disclaimer}
          </p>
        </footer>
      </div>
    </main>
  );
}
