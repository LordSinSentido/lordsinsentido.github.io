import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initHeroIntro(): void {
  const els = gsap.utils.toArray<HTMLElement>('[data-hero-stagger]');
  if (els.length === 0) return;

  if (prefersReducedMotion()) {
    gsap.set(els, { autoAlpha: 1, y: 0 });
    return;
  }

  gsap.set(els, { autoAlpha: 0, y: 16 });
  gsap.to(els, {
    autoAlpha: 1,
    y: 0,
    duration: 0.7,
    ease: 'power2.out',
    stagger: 0.08,
    delay: 0.1,
  });
}

export function initReveals(root: ParentNode = document): void {
  if (prefersReducedMotion()) return;

  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.set(el, { autoAlpha: 0, y: 16 });
    gsap.to(el, {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

export function initMotion(): void {
  initHeroIntro();
  initReveals();
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
