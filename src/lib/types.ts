export interface Social {
  github: string;
  linkedin: string;
  twitter: string;
}

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  photoUrl: string;
  location: string;
  email: string;
  resumeUrl: string;
  social: Social;
}

export interface SkillItem {
  name: string;
  icon: string;
}

export interface SkillCategory {
  category: string;
  order: number;
  items: SkillItem[];
}

export interface Experience {
  company: string;
  logoUrl: string | null;
  role: string;
  location: string;
  periodStart: string;
  periodEnd: string | null;
  current: boolean;
  description: string;
  highlights: string[];
  tech: string[];
  order: number;
}

export interface Project {
  title: string;
  description: string;
  demoUrl: string | null;
  repoUrl: string | null;
  tech: string[];
  tags: string[];
  featured: boolean;
  order: number;
}

export interface Education {
  institution: string;
  imageUrl: string | null;
  degree: string;
  periodStart: string;
  periodEnd: string;
  description: string;
  order: number;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
  url: string | null;
  imageUrl: string | null;
  order: number;
}
