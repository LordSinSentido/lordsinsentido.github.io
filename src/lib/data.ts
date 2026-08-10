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

async function loadPortfolio(): Promise<PortfolioData> {
  const [profile, skills, experience, projects, education, certifications] = await Promise.all([
    getDoc<Profile>('profile', 'main'),
    getCollection<SkillCategory>('skills'),
    getCollection<Experience>('experience'),
    getCollection<Project>('projects'),
    getCollection<Education>('education'),
    getCollection<Certification>('certifications'),
  ]);

  return { profile, skills, experience, projects, education, certifications };
}

export default loadPortfolio;
