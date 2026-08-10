import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const serviceAccount = JSON.parse(
  readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf8'),
);

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

const seedData = {
  profile: {
    main: {
      name: 'Your Name',
      role: 'Software Engineer',
      tagline: 'I build fast, accessible web experiences.',
      bio: 'Write your bio here: who you are, what you do, and what drives you.',
      photoUrl: '',
      location: 'City, Country',
      email: 'you@example.com',
      resumeUrl: '',
      social: {
        github: 'https://github.com/yourusername',
        linkedin: 'https://linkedin.com/in/yourusername',
        twitter: 'https://twitter.com/yourusername',
      },
    },
  },
  skills: {
    frontend: {
      category: 'Frontend',
      order: 1,
      items: [
        { name: 'TypeScript', icon: 'typescript' },
        { name: 'React', icon: 'react' },
        { name: 'Tailwind CSS', icon: 'tailwind' },
      ],
    },
    backend: {
      category: 'Backend',
      order: 2,
      items: [
        { name: 'Node.js', icon: 'nodejs' },
        { name: 'Firebase', icon: 'firebase' },
        { name: 'PostgreSQL', icon: 'postgresql' },
      ],
    },
    tools: {
      category: 'Tools & Others',
      order: 3,
      items: [
        { name: 'Git', icon: 'git' },
        { name: 'Docker', icon: 'docker' },
        { name: 'Figma', icon: 'figma' },
      ],
    },
  },
  experience: {
    exp1: {
      company: 'Company A',
      logoUrl: null,
      role: 'Senior Software Engineer',
      location: 'Remote',
      periodStart: '2023-01-01',
      periodEnd: null,
      current: true,
      description: 'Short description of the role.',
      highlights: ['Led a team of 4 engineers', 'Cut page load time by 40%'],
      tech: ['TypeScript', 'React', 'Node.js'],
      order: 1,
    },
    exp2: {
      company: 'Company B',
      logoUrl: null,
      role: 'Software Engineer',
      location: 'City, Country',
      periodStart: '2020-06-01',
      periodEnd: '2022-12-31',
      current: false,
      description: 'Short description of the role.',
      highlights: ['Shipped a billing system', 'Mentored 2 junior devs'],
      tech: ['Python', 'Django', 'PostgreSQL'],
      order: 2,
    },
  },
  projects: {
    proj1: {
      title: 'Project One',
      description: 'A project that solves a real problem. Describe what it does and your role.',
      demoUrl: 'https://example.com',
      repoUrl: 'https://github.com/yourusername/project-one',
      tech: ['TypeScript', 'React', 'Firebase'],
      tags: ['Web App', 'Open Source'],
      featured: true,
      order: 1,
    },
    proj2: {
      title: 'Project Two',
      description: 'Another project. Highlight the outcome and the stack.',
      demoUrl: null,
      repoUrl: 'https://github.com/yourusername/project-two',
      tech: ['Astro', 'Tailwind CSS'],
      tags: ['Portfolio'],
      featured: false,
      order: 2,
    },
  },
  education: {
    edu1: {
      institution: 'University Name',
      degree: "Bachelor's in Computer Science",
      periodStart: '2016-08-01',
      periodEnd: '2020-05-01',
      description: 'Focus on software engineering and algorithms.',
      order: 1,
    },
  },
  certifications: {
    cert1: {
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      year: '2024',
      url: 'https://aws.amazon.com/certification/',
      imageUrl: 'https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Developer-Associate_badge.634f8a21af2e0e66ed2fef2b7a0a4e2e0f6f3e5d.png',
      order: 1,
    },
    cert2: {
      name: 'Google Cloud Professional Developer',
      issuer: 'Google Cloud',
      year: '2023',
      url: 'https://cloud.google.com/certification',
      imageUrl: null,
      order: 2,
    },
  },
};

async function seed() {
  for (const [collection, docs] of Object.entries(seedData)) {
    for (const [docId, data] of Object.entries(docs)) {
      await db.collection(collection).doc(docId).set(data);
      console.log(`Seeded ${collection}/${docId}`);
    }
  }
  console.log('Done. All collections seeded.');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => app.delete());
