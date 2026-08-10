import type { PortfolioData } from "./data";
import type {
  Profile,
  SkillCategory,
  Experience,
  Project,
  Education,
  Certification,
} from "./types";
import loadPortfolio from "./data";
import { icon } from "./icons";
import { initReveals } from "./motion";
import { esc, formatPeriod } from "./text";
import { badge } from "./badge";
import { renderCard } from "./cards";

let cached: Promise<PortfolioData> | null = null;

export function getPortfolio(): Promise<PortfolioData> {
  cached ??= loadPortfolio();
  return cached;
}

export function hydrate(
  selector: string,
  build: (data: PortfolioData) => string,
): void {
  const root = document.querySelector<HTMLElement>(selector);
  if (!root) return;
  getPortfolio()
    .then((data) => {
      root.innerHTML = build(data);
      initReveals(root);
    })
    .catch((err) => {
      console.error("Failed to load portfolio data:", err);
      root.innerHTML =
        '<p class="py-10 text-center text-sm text-muted">Could not load content.</p>';
    });
}

export function socialRow(social: Profile["social"]): string {
  return [
    { name: "github", href: social.github },
    { name: "linkedin", href: social.linkedin },
    { name: "twitter", href: social.twitter },
  ]
    .filter((link) => link.href)
    .map(
      (link) =>
        `<a href="${esc(link.href)}" aria-label="${link.name}" target="_blank" rel="noopener noreferrer" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:border-accent/40 hover:text-accent">${icon(link.name)}</a>`,
    )
    .join("");
}

export function renderHeaderContact(profile: Profile): string {
  const parts: string[] = [
    `<a href="mailto:${esc(profile.email)}" class="inline-flex items-center gap-2 font-medium text-ink transition hover:text-accent">${icon("mail", 15)}${esc(profile.email)}</a>`,
    `<span class="inline-flex items-center gap-2 text-muted">${icon("map-pin", 15)}${esc(profile.location)}</span>`,
    `<span class="flex items-center gap-2.5">${socialRow(profile.social)}</span>`,
  ];

  if (profile.resumeUrl) {
    parts.push(
      `<a href="${esc(profile.resumeUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 font-medium text-accent transition hover:text-ink">${icon("download", 15)}Résumé</a>`,
    );
  }

  return parts.join("");
}

export function renderSkills(skills: SkillCategory[]): string {
  if (skills.length === 0)
    return '<p class="py-10 text-center text-sm text-muted">No skills yet.</p>';

  const chipTones = ["accent", "sage", "lavender", "butter", "neutral"] as const;

  const colorByCategory = new Map<string, (typeof chipTones)[number]>();
  skills.forEach((category, index) => {
    if (!colorByCategory.has(category.category)) {
      colorByCategory.set(
        category.category,
        chipTones[index % chipTones.length],
      );
    }
  });

  const items = skills
    .flatMap((category) =>
      category.items.map((item) => ({
        name: item.name,
        tone: colorByCategory.get(category.category) ?? "neutral",
      })),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return `
    <div class="flex flex-wrap gap-3" data-reveal>
      ${items
        .map((item) => badge({ label: item.name, tone: item.tone, size: "lg" }))
        .join("")}
    </div>`;
}

export function renderExperience(experience: Experience[]): string {
  if (experience.length === 0)
    return '<p class="py-10 text-center text-sm text-muted">No experience yet.</p>';

  return `
    <ol class="mt-2">
      ${experience
        .map(
          (job) => `
        <li data-reveal class="relative border-l border-line pb-10 pl-6 last:pb-0">
          <span class="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${job.current ? "bg-sage-deep" : "bg-accent"} ring-4 ring-base"></span>
          <div class="flex items-stretch gap-5">
            ${
              job.logoUrl
                ? `<img src="${esc(job.logoUrl)}" alt="${esc(job.company)} logo" class="h-16 w-16 shrink-0 self-start overflow-hidden rounded-lg border border-line object-cover" loading="lazy" />`
                : `<span class="flex h-16 w-16 shrink-0 self-start items-center justify-center rounded-lg border border-line bg-surface p-1.5 text-accent">${icon("briefcase", 24)}</span>`
            }
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 class="font-display text-lg font-semibold text-ink">${esc(job.company)}</h3>
                ${job.current ? badge({ label: "Current", tone: "sage", size: "sm" }) : ""}
              </div>
              <p class="mt-0.5 text-sm font-medium text-accent">
                ${esc(job.role)}${job.location ? `<span class="text-muted"> · ${esc(job.location)}</span>` : ""}
              </p>
              <p class="mt-1 text-xs font-medium uppercase tracking-wide text-muted">${esc(formatPeriod(job.periodStart, job.periodEnd))}</p>
              <p class="mt-3 text-sm leading-relaxed text-muted">${esc(job.description)}</p>
              ${
                job.highlights.length > 0
                  ? `<ul class="mt-4 space-y-2">${job.highlights
                      .map(
                        (h) =>
                          `<li class="flex gap-2 text-sm text-muted"><span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"></span>${esc(h)}</li>`,
                      )
                      .join("")}</ul>`
                  : ""
              }
              ${
                job.tech.length > 0
                  ? `<div class="mt-4 flex flex-wrap gap-2">${job.tech
                      .map((t) => badge({ label: t }))
                      .join("")}</div>`
                  : ""
              }
            </div>
          </div>
        </li>`,
        )
        .join("")}
    </ol>`;
}

export function renderProjects(projects: Project[]): string {
  if (projects.length === 0)
    return '<p class="py-10 text-center text-sm text-muted">No projects yet.</p>';

  return `
    <div class="grid gap-x-8 gap-y-14 md:grid-cols-2">
      ${projects
        .map(
          (project) =>
            renderCard({
              eyebrowIcon: "code",
              eyebrowLabel: "Project",
              title: project.title,
              description: project.description,
              featured: project.featured,
              tags: project.tech,
              links: [
                ...(project.demoUrl
                  ? [{ href: project.demoUrl, label: "Demo", icon: "external-link" }]
                  : []),
                ...(project.repoUrl
                  ? [{ href: project.repoUrl, label: "Code", icon: "arrow-up-right" }]
                  : []),
              ],
            }),
        )
        .join("")}
    </div>`;
}

export function renderEducation(
  education: Education[],
  certifications: Certification[],
): string {
  const eduCards = education.map((entry) =>
    renderCard({
      eyebrowIcon: "graduation-cap",
      eyebrowLabel: "Education",
      title: entry.institution,
      subtitle: entry.degree,
      meta: formatPeriod(entry.periodStart, entry.periodEnd),
      description: entry.description,
    }),
  );

  const certCards = certifications.map((cert) =>
    renderCard({
      eyebrowIcon: "award",
      eyebrowLabel: "Certification",
      title: cert.name,
      subtitle: cert.issuer,
      meta: cert.year,
      image: {
        src: cert.imageUrl,
        alt: `${cert.name} badge`,
        fallbackIcon: "award",
      },
      links: cert.url
        ? [{ href: cert.url, label: "View credential", icon: "external-link" }]
        : [],
    }),
  );

  const cards = [...eduCards, ...certCards];

  if (cards.length === 0)
    return '<p class="py-10 text-center text-sm text-muted">No education yet.</p>';

  return `<div class="grid gap-x-10 gap-y-12 sm:grid-cols-2">${cards.join("")}</div>`;
}

export function renderContact(profile: Profile): string {
  return `
    <div class="flex flex-col items-start gap-6">
      <a href="mailto:${esc(profile.email)}" class="inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-lift">
        ${icon("mail", 20)}${esc(profile.email)}
      </a>
      ${profile.resumeUrl ? `<a href="${esc(profile.resumeUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-ink">${icon("download", 16)}Download résumé</a>` : ""}
      <div class="flex items-center gap-5">${socialRow(profile.social)}</div>
    </div>`;
}
