import { icon } from "./icons";
import { esc } from "./text";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "sage"
  | "butter"
  | "clay"
  | "lavender";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeOptions {
  label: string;
  tone?: BadgeTone;
  size?: BadgeSize;
  icon?: string;
  dot?: boolean;
  class?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border border-line bg-surface-2 font-medium text-ink/80",
  accent: "border border-accent/40 bg-accent-soft text-accent",
  sage: "border border-sage-deep/40 bg-sage/40 font-semibold text-sage-deep",
  butter: "border border-butter-deep/40 bg-butter/40 font-semibold text-butter-deep",
  clay: "border border-clay-deep/40 bg-clay/40 font-semibold text-clay-deep",
  lavender: "border border-lavender-deep/40 bg-lavender font-medium text-lavender-deep",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2.5 py-0.5",
  md: "px-3 py-1",
  lg: "px-3.5 py-1.5 text-sm",
};

export function badge(options: BadgeOptions): string {
  const { label, tone = "neutral", size = "md", icon: iconName, dot, class: extraClass } = options;

  const dotHtml = dot ? '<span class="h-2 w-2 rounded-full bg-current"></span>' : "";
  const iconHtml = iconName ? icon(iconName, 12) : "";

  return `
    <span class="inline-flex items-center gap-1.5 rounded-full text-xs ${toneClasses[tone]} ${sizeClasses[size]} ${extraClass ?? ""}">
      ${dotHtml}${iconHtml}${esc(label)}
    </span>`;
}
