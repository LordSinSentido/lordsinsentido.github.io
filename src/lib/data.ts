import { getCollection, getDoc } from './firebase';
import type {
  Profile,
  SkillCategory,
  Experience,
  Project,
  Education,
  Certification,
} from './types';

export interface PortfolioData {
  profile: Profile | null;
  skills: SkillCategory[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
}

const CACHE_KEY = 'porfolio.data.v1';
const CACHE_TTL_MS = 60 * 60 * 1000;

interface CacheEntry {
  savedAt: number;
  data: PortfolioData;
}

function readCache(): PortfolioData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.savedAt > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache(data: PortfolioData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    /* storage unavailable, ignore */
  }
}

export function clearPortfolioCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* storage unavailable, ignore */
  }
}

async function loadPortfolio(): Promise<PortfolioData> {
  const cached = readCache();
  if (cached) return cached;

  const [profile, skills, experience, projects, education, certifications] = await Promise.all([
    getDoc<Profile>('profile', 'main'),
    getCollection<SkillCategory>('skills'),
    getCollection<Experience>('experience'),
    getCollection<Project>('projects'),
    getCollection<Education>('education'),
    getCollection<Certification>('certifications'),
  ]);

  const data: PortfolioData = { profile, skills, experience, projects, education, certifications };
  writeCache(data);
  return data;
}

export default loadPortfolio;
