import Image from "next/image";
import Link from "next/link";
import type { Art, Diet, Menu, MenuGroup, MenuItem, MenuSection } from "@/data/menu-types";
import { CategoryRail } from "./CategoryRail";
import { MenuReveal } from "./MenuReveal";

/**
 * Renders one menu — food or bar — as the printed one is laid out.
 *
 * Server component. Every item is real HTML in the initial response, which is
 * the entire reason the menu is a page and not a section: a crawler that reads
 * this once has the whole card, prices and all. The client pieces — the sticky
 * rail, the reveal — are leaves that attach behaviour to markup already here.
 * The masthead, the Food | Bar switch and the loader live one level up, in
 * the /menu layout, so they persist while this card is swapped for the other.
 *
 * ── Fidelity to the print ───────────────────────────────────────────────────
 *
 * Section headings in the bar card's script face, red, large, on both cards
 * (the print's serif survives only on the masthead). Sub-groups under a small red bold label with
 * the veg / non-veg square. Item names bold uppercase sans, price bold on the
 * same line, description in the regular weight beneath. Two columns from `md`
 * up, one on a phone. The drawing printed beside each section sits beside it
 * here, on the page the print gives it; the three photographs that open Soups,
 * Dim Sum and Biryani open them here. Cream paper throughout.
 */

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

/**
 * One of the print's drawings. Exported with its paper ground cut to alpha,
 * so it lands on the page the way ink does — no blend mode, nothing to flash
 * while a section fades in. `data-art` is what the reveal animates.
 */
function Drawing({
  art,
  className,
  sizes,
  critical,
}: {
  art: Art;
  className: string;
  /** The rendered width per breakpoint — what next/image picks a candidate by. */
  sizes: string;
  critical?: boolean;
}) {
  return (
    <figure data-art data-critical={critical ? "" : undefined} aria-hidden="true" className={className}>
      <Image
        src={art.src}
        alt=""
        width={art.width}
        height={art.height}
        sizes={sizes}
        className="h-auto w-full"
        priority={critical}
        loading={critical ? undefined : "lazy"}
      />
    </figure>
  );
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
  const header = (hasLabel || hasPriceLabels) && (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
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
  );
  return (
    <div className="mt-7 first:mt-6">
      {/*
        A group with its own drawing — the second page of Signature Cocktails,
        the non-veg page of Small Plates — carries it small, beside the label,
        the way the print gives that page its own spot illustration.
      */}
      {group.art ? (
        <div className="mb-3 flex items-center justify-between gap-5">
          <div className="min-w-0 flex-1">{header}</div>
          <Drawing art={group.art} sizes="(min-width: 768px) 80px, 64px" className="w-16 shrink-0 md:w-20" />
        </div>
      ) : (
        header && <div className="mb-4">{header}</div>
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

function Section({
  section,
  script,
  first,
}: {
  section: MenuSection;
  script: boolean;
  /** The first section on the page: its images are above the fold and gate the loader. */
  first: boolean;
}) {
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
        <figure
          data-parallax
          data-critical={first ? "" : undefined}
          className="mb-9 overflow-hidden rounded-2xl md:mb-12"
        >
          <Image
            src={section.photo.src}
            alt={section.photo.alt}
            width={section.photo.width}
            height={section.photo.height}
            sizes="(min-width: 1024px) 896px, 100vw"
            className="h-auto w-full object-cover md:max-h-[34rem]"
            /* The opening photograph is the page's largest paint; it must not
               wait for a lazy-load threshold it has already crossed. */
            priority={first}
            loading={first ? undefined : "lazy"}
          />
        </figure>
      )}

      {/*
        ── Heading, drawing, groups ──────────────────────────────────────────

        Phone: the heading and its drawing share a row (a flex row), the groups
        follow full width. From `md` the row dissolves (`contents`) and all
        three become cells of one grid, each placed EXPLICITLY:

            col 1            col 2
            heading          drawing (rows 1–2)
            groups

        Explicit because auto-placement bit once: with no drawing, a span-only
        groups cell auto-flowed into the empty second column and the whole
        section rendered as a narrow strip beside its heading. Every cell now
        names its column and row, and a section with no drawing simply has an
        empty second column — so the text keeps the same measure on every
        section, drawing or not, as the print's columns do.
      */}
      <div className="md:grid md:grid-cols-[1fr_11rem] md:gap-x-10">
        <div className="flex items-center justify-between gap-5 md:contents">
          {/*
            The bar card's hand-lettered face on both cards. The print sets
            the food headings in a serif, but the client preferred the one
            voice across the two menus; the serif stays on the masthead's
            "Menu" alone.
          */}
          <h2
            id={`${section.id}-title`}
            className="font-menu-script text-[2.75rem] leading-[0.95] font-semibold text-menu-red text-balance md:col-start-1 md:row-start-1 md:text-[3.5rem]"
          >
            {section.title}
          </h2>
          {section.art && (
            <Drawing
              art={section.art}
              critical={first}
              sizes={section.art.wide ? "(min-width: 768px) 176px, 128px" : "(min-width: 768px) 160px, 96px"}
              className={`shrink-0 md:col-start-2 md:row-span-2 md:row-start-1 md:self-start md:pt-2 ${
                section.art.wide ? "w-32 md:w-44" : "w-24 md:w-40"
              }`}
            />
          )}
        </div>

        <div className="md:col-start-1 md:row-start-2">
          {section.groups.map((g, i) => (
            <Group key={g.label ?? i} group={g} script={script} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** The food menu's back page: an invitation, with the print's own contact line. */
function Closing({ closing }: { closing: NonNullable<Menu["closing"]> }) {
  const tel = closing.phone?.replace(/\s+/g, "");
  return (
    <section
      aria-labelledby="closing-title"
      data-reveal
      style={{ opacity: 0 }}
      className="border-t border-menu-red/15 py-12 md:py-16"
    >
      <div className="grid items-center gap-8 md:grid-cols-[11rem_1fr] md:gap-12">
        <Drawing art={closing.art} sizes="(min-width: 768px) 176px, 144px" className="w-36 md:w-full" />
        <div>
          <h2
            id="closing-title"
            className="font-menu-script text-[2.75rem] leading-[0.95] font-semibold text-menu-red text-balance md:text-[3.5rem]"
          >
            {closing.title}
          </h2>
          {closing.body.map((paragraph) => (
            <p
              key={paragraph}
              className="mt-4 max-w-[58ch] font-menu-sans text-[13px] leading-[1.6] text-menu-ink/80 md:text-sm"
            >
              {paragraph}
            </p>
          ))}
          <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3">
            <Link
              href="/#reserve"
              className="rounded-full bg-menu-red px-6 py-3 font-menu-sans text-[11px] font-bold tracking-[0.18em] text-menu-paper uppercase transition-transform duration-100 ease-out-strong active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-menu-red focus-visible:ring-offset-2 focus-visible:ring-offset-menu-paper focus-visible:outline-none"
            >
              Plan a celebration
            </Link>
            {closing.phone && (
              <a href={`tel:${tel}`} className="font-menu-sans text-[13px] font-semibold text-menu-red">
                {closing.phone}
              </a>
            )}
            {closing.email && (
              <a href={`mailto:${closing.email}`} className="font-menu-sans text-[13px] font-semibold text-menu-red">
                {closing.email}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function MenuPage({ menu }: { menu: Menu }) {
  const script = menu.id === "bar";
  const entries = menu.sections.map((s) => ({ id: s.id, title: s.title }));

  return (
    <>
      <MenuReveal />

      {/*
        The rail. Sticky beneath the fixed band — 4.75rem clears the hamburger
        pill on a phone, 5.75rem on desktop — with the paper continuing behind
        it and a hairline so content scrolling under reads as under. It starts
        hidden and the reveal brings its chips in.
      */}
      <div
        data-rail-sticky
        className="sticky top-[4.75rem] z-30 border-b border-menu-red/15 bg-menu-paper/95 backdrop-blur-sm md:top-[5.75rem]"
      >
        <div data-reveal-rail style={{ opacity: 0 }} className="mx-auto max-w-4xl">
          <CategoryRail entries={entries} />
        </div>
      </div>

      {/* Bottom padding on a phone keeps the last lines clear of the docked switch. */}
      <div className="mx-auto max-w-4xl px-5 pb-24 md:px-8 md:pb-0">
        {menu.sections.map((s, i) => (
          <Section key={s.id} section={s} script={script} first={i === 0} />
        ))}

        {menu.closing && <Closing closing={menu.closing} />}

        <footer className="border-t border-menu-red/15 py-10 md:py-14">
          <Image
            src={script ? "/assets/menu/swash-brown.png" : "/assets/menu/swash-red.png"}
            alt=""
            width={script ? 478 : 454}
            height={script ? 253 : 215}
            aria-hidden="true"
            className="mb-8 ml-auto h-auto w-28 md:w-36"
            loading="lazy"
          />
          <p className="max-w-3xl font-menu-sans text-[11px] leading-relaxed text-menu-ink/60">
            {menu.disclaimer}
          </p>
        </footer>
      </div>
    </>
  );
}
