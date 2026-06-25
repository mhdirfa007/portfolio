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

export interface ResumeCertification {
  name: string
  expiry: string
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
    phone: string
  }
  summary: string
  skills: {
    languages: string[]
    frameworks: string[]
    tools: string[]
    databases: string[]
  }
  experience: ResumeExperience[]
  projects: ResumeProject[]
  education: {
    school: string
    degree: string
    period: string
    detail: string
  }
  certifications: ResumeCertification[]
  achievements: string[]
  leadership: string[]
}

export const resume: ResumeData = {
  name: 'MOHAMED IRFAN',
  title: 'AI / Backend Developer',
  tagline: 'B.Tech CSBS student building LLM, RAG & automation systems.',
  contact: {
    email: 'mohamedirfan.me@gmail.com',
    phone: '+91 9842178891',
    location: 'Tenkasi, Tamil Nadu, India',
    github: 'github.com/mhdirfa007',
    linkedin: 'linkedin.com/in/mohamed-irfan',
  },
  summary:
    'Final-year B.Tech (CSBS) student experienced in building backend ' +
    'applications using Python, FastAPI, and Java. Worked on projects involving ' +
    'LLM integration, RAG systems, and workflow automation. Eager to contribute ' +
    'to building AI solutions that solve real-world business problems.',
  skills: {
    languages: ['Python', 'Java', 'SQL'],
    frameworks: ['FastAPI', 'LangChain', 'Ollama', 'REST APIs', 'NLTK', 'TextBlob'],
    tools: ['Git', 'GitHub', 'Postman', 'n8n', 'VS Code'],
    databases: ['MySQL', 'ChromaDB', 'SQLite'],
  },
  experience: [
    {
      company: 'Zapyo Fashions (Remote)',
      role: 'AI & Automation Intern',
      period: 'Jul 2024',
      highlights: [
        'Designed & deployed an LLM-powered customer care bot handling order queries, FAQs, and support via workflow orchestration — reducing manual support load.',
        'Integrated REST APIs for real-time order tracking, customer interaction logging, and automated response generation — gaining hands-on exposure to production-grade API pipelines.',
      ],
    },
  ],
  projects: [
    {
      name: 'RAG-Based AI Knowledge Assistant',
      stack: 'Python · FastAPI · Ollama · LangChain · ChromaDB',
      year: 'Jul 2025',
      description:
        'Retrieval-Augmented Generation system with local LLM inference, document chunking, embedding generation, and vector similarity search for context-aware responses; engineered scalable FastAPI endpoints with modular retrieval pipelines.',
    },
    {
      name: 'AI Customer Support Agent',
      stack: 'Python · FastAPI · Ollama · n8n · REST APIs',
      year: 'Dec 2025',
      description:
        'LLM-powered support agent integrating REST APIs for order tracking, FAQs, and interaction logging; automated query routing & response generation via n8n workflows to reduce manual intervention.',
    },
    {
      name: 'Sentiment Analyzer Pipeline',
      stack: 'Python · n8n · NLTK · TextBlob · REST APIs',
      year: 'Jan 2025',
      description:
        'End-to-end sentiment analysis pipeline with data scraping, text preprocessing, tokenization, and polarity-based classification; n8n workflow automation for continuous processing and reporting.',
    },
  ],
  education: {
    school: 'Panimalar Engineering College, Poonamalle',
    degree: 'B.Tech — Computer Science & Business Systems (CSBS)',
    period: '2023 — 2027',
    detail: 'CGPA: 8.3',
  },
  certifications: [
    {
      name: 'Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate',
      expiry: 'Exp: Jul 2027',
    },
    {
      name: 'Oracle Cloud Data Management 2023 Certified Foundations Associate',
      expiry: 'Exp: Jul 2026',
    },
    {
      name: 'RAG for Production with LangChain & LlamaIndex',
      expiry: 'Jun 9 2026',
    },
    {
      name: 'Gen AI Certification — Prepinsta Technologies PVT. LTD',
      expiry: 'Jun 7 2026',
    },
  ],
  achievements: [
    "Winner — Intercollege 'King of Coding' competitive programming event (Spiders).",
    'District-level football player.',
  ],
  leadership: [
    'Math Club Coordinator (2024-2026)',
    'YRC Dept Coordinator (2024-2026)',
    'Organized PEC HACKS 3.0 (Dec 2025)',
  ],
}
