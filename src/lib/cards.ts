import { icon } from "./icons";
import { esc } from "./text";
import { badge } from "./badge";

export interface CardLink {
  href: string;
  label: string;
  icon?: string;
}

export interface CardImage {
  src: string | null;
  alt: string;
  fallbackIcon?: string;
}

export interface CardOptions {
  eyebrowIcon: string;
  eyebrowLabel: string;
  title: string;
  subtitle?: string;
  meta?: string;
  description?: string;
  featured?: boolean;
  tags?: string[];
  image?: CardImage;
  links?: CardLink[];
}

export function renderCard(options: CardOptions): string {
  const { eyebrowIcon, eyebrowLabel, title, subtitle, meta, description, featured, tags, image, links } = options;

  const eyebrow = `
    <span class="inline-flex items-center gap-2 text-accent">
      ${icon(eyebrowIcon, 14)}
      <span class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">${esc(eyebrowLabel)}</span>
    </span>`;

  const titleRow = `
    <div class="flex flex-wrap items-center gap-3">
      <h3 class="font-display text-xl font-semibold text-ink">${esc(title)}</h3>
      ${featured ? badge({ label: "Featured", tone: "butter", size: "sm", icon: "star" }) : ""}
    </div>`;

  const body = `
    <div class="flex-1">
      ${titleRow}
      ${subtitle ? `<p class="mt-1 text-sm font-medium text-accent">${esc(subtitle)}</p>` : ""}
      ${meta ? `<p class="mt-1 text-xs font-medium uppercase tracking-wide text-muted">${esc(meta)}</p>` : ""}
      ${description ? `<p class="mt-3 text-sm leading-relaxed text-muted">${esc(description)}</p>` : ""}
      ${tags && tags.length ? `
      <div class="mt-4 flex flex-wrap gap-2">${tags
        .map((t) => badge({ label: t }))
        .join("")}</div>` : ""}
      ${links && links.length ? `
      <div class="mt-6 flex items-center gap-5">${links
        .map(
          (link) =>
            `<a href="${esc(link.href)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition hover:text-ink">${esc(link.label)} ${icon(link.icon ?? "external-link", 14)}</a>`,
        )
        .join("")}</div>` : ""}
    </div>`;

  const imageHtml = image
    ? image.src
      ? `<img src="${esc(image.src)}" alt="${esc(image.alt)}" class="h-16 w-16 shrink-0 self-start overflow-hidden rounded-lg border border-line object-cover" loading="lazy" />`
      : `<span class="flex h-16 w-16 shrink-0 self-start items-center justify-center rounded-lg border border-line bg-surface p-1.5 text-accent">${icon(image.fallbackIcon ?? eyebrowIcon, 24)}</span>`
    : "";

  return `
    <div data-reveal class="border-t border-line pt-6">
      ${eyebrow}
      <div class="mt-2 flex items-stretch gap-5">${body}${imageHtml}</div>
    </div>`;
}
