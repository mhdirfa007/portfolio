// Resume data shown on the CRT screen of the retro computer portfolio.
// Edit this file to make the portfolio truly yours.

export interface ResumeProject {
  name: string
  stack: string
  year: string
  description: string
}

export interface ResumeExperience {
  company: string
  role: string
  period: string
  highlights: string[]
}

export interface ResumeData {
  name: string
  title: string
  tagline: string
  contact: {
    email: string
    location: string
    github: string
    linkedin: string
  }
  summary: string
  skills: string[]
  experience: ResumeExperience[]
  projects: ResumeProject[]
  education: {
    school: string
    degree: string
    period: string
  }
}

export const resume: ResumeData = {
  name: 'ALEX CARTER',
  title: 'Full-Stack Engineer',
  tagline: 'I build things for the web — and occasionally for the desktop.',
  contact: {
    email: 'alex.carter@example.com',
    location: 'San Francisco, CA',
    github: 'github.com/alexcarter',
    linkedin: 'linkedin.com/in/alexcarter',
  },
  summary:
    'Engineer with 7+ years building scalable web applications. ' +
    'I care about clean architecture, fast UX, and shipping software that lasts. ' +
    'Comfortable across the stack — from databases to design systems.',
  skills: [
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Go',
    'PostgreSQL',
    'AWS',
    'Docker',
    'GraphQL',
    'Three.js',
  ],
  experience: [
    {
      company: 'Helix Labs',
      role: 'Senior Software Engineer',
      period: '2022 — Present',
      highlights: [
        'Led the rebuild of the core analytics dashboard, cutting load time by 60%.',
        'Designed a real-time event pipeline handling 5M events/day.',
      ],
    },
    {
      company: 'Northwind Software',
      role: 'Software Engineer',
      period: '2019 — 2022',
      highlights: [
        'Shipped the design-system v2 adopted across 6 product teams.',
        'Built the billing microservice in Go, processing $20M annually.',
      ],
    },
  ],
  projects: [
    {
      name: 'retrospec',
      stack: 'Next.js · WebGL · Rust',
      year: '2025',
      description: 'A browser-based 3D modeling tool with a node-based shader editor.',
    },
    {
      name: 'telemetry-bridge',
      stack: 'Go · Kafka · ClickHouse',
      year: '2024',
      description: 'A self-hostable observability gateway for distributed systems.',
    },
  ],
  education: {
    school: 'University of California, Berkeley',
    degree: 'B.S. in Computer Science',
    period: '2015 — 2019',
  },
}
