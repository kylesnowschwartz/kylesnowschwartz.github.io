/**
 * CV Structured Data
 * All structured data for the CV page lives here.
 * Prose content is in _profile.md and _roles.md
 */

export interface CareerEntry {
  role: string;
  company: string;
  location?: string;
  type?: string;
  startDate: string;
  endDate?: string;
}

export interface SkillCategory {
  heading: string;
  skills: string[];
}

export interface Qualification {
  credential: string;
  institution: string;
  location?: string;
  year: string;
}

export interface CVData {
  name: string;
  title: string;
  tagline?: string;
  location: string;
  phone?: string;
  email: string;
  github?: string;
  linkedin?: string;
  updated: string;
  career?: CareerEntry[];
  careerNote?: string;
  skills?: SkillCategory[];
  qualifications?: Qualification[];
}

export const cv: CVData = {
  name: "Kyle Snow Schwartz",
  title: "Full Stack Software Engineer",
  tagline: "Improving Developer Experience Through AI and Automation",
  location: "Wellington, New Zealand",
  phone: "+64 204 065 8034",
  email: "Kyle.SnowSchwartz@gmail.com",
  github: "kylesnowschwartz",
  updated: "2025-12",

  career: [
    {
      role: "Senior Engineer",
      company: "Envato",
      location: "NZ",
      type: "fully remote",
      startDate: "Apr 2021",
    },
    {
      role: "Senior Developer",
      company: "Flux Federation / Powershop",
      location: "NZ",
      type: "fully remote",
      startDate: "Oct 2015",
      endDate: "Mar 2021",
    },
    {
      role: "Team Lead",
      company: "Flux Federation / Powershop",
      location: "NZ",
      type: "fully remote",
      startDate: "Sep 2019",
      endDate: "Aug 2020",
    },
  ],

  careerNote:
    "Prior roles include teaching English in Vietnam, and earlier hospitality experience in New York City, including senior positions at the Michelin-starred Dovetail Restaurant in NYC, and Grandaisy Artisan Bakery.",

  skills: [
    {
      heading: "AI & LLMs",
      skills: [
        "Claude Code plugin development",
        "MCP servers",
        "Context engineering",
        "Agentic workflows",
        "AI adoption and enablement",
      ],
    },
    {
      heading: "Languages & Frameworks",
      skills: [
        "Ruby-on-Rails",
        "JavaScript",
        "Go",
        "Python",
        "React",
        "Astro",
      ],
    },
    {
      heading: "CLI & Tooling",
      skills: [
        "Emacs",
        "Neovim",
        "TUI design",
        "Modern utilities",
        "VCS & CI/CD (Buildkite, GitHub Actions, Jenkins, GitLab)",
      ],
    },
    {
      heading: "Infrastructure",
      skills: [
        "AWS",
        "Cloudflare",
        "Terraform",
        "Security and resilience",
        "Performance optimization",
      ],
    },
    {
      heading: "How I Work",
      skills: [
        "Written clarity and kind, direct feedback",
        "Clean code, continuous improvement, simplicity",
        "Autonomy with accountability",
        "Coaching over instructing",
        "Humanism as a core value",
      ],
    },
  ],

  qualifications: [
    {
      credential: "Full Stack Ruby-on-Rails Development",
      institution: "Enspiral Dev Academy",
      location: "Wellington, NZ",
      year: "2015",
    },
    {
      credential: "Bachelor of Arts (Economics)",
      institution: "Bard College",
      location: "New York, USA",
      year: "2009",
    },
    {
      credential: "Mental Health First Aid Responder",
      institution: "CoLiberate",
      location: "Wellington, NZ",
      year: "Current",
    },
  ],
};
