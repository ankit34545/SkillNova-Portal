export interface LearningTrack {
  id: string;
  title: string;
  role: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  durationWeeks: number;
  projectCount: number;
  rating: number;
  enrolledStudents: number;
  tags: string[];
  gradient: string;
  iconName: string;
  description: string;
  keySkills: string[];
  avgPackage: string;
}

export const FEATURED_TRACKS: LearningTrack[] = [
  {
    id: "ai-eng",
    title: "Generative AI & LLM Systems",
    role: "AI Engineer / Applied Scientist",
    level: "Intermediate",
    durationWeeks: 14,
    projectCount: 6,
    rating: 4.94,
    enrolledStudents: 14200,
    tags: ["RAG Pipelines", "PyTorch", "vLLM", "Vector DBs"],
    gradient: "from-purple-500/20 via-indigo-500/20 to-cyan-500/20",
    iconName: "Cpu",
    description: "Build production-ready agentic workflows, fine-tune open-source models, and architect high-concurrency vector retrieval systems.",
    keySkills: ["LangChain", "LlamaIndex", "Hugging Face", "CUDA Basics", "Postgres pgvector"],
    avgPackage: "₹24 LPA"
  },
  {
    id: "fullstack-cloud",
    title: "Next.js, Go & Distributed Systems",
    role: "Full-Stack Product Engineer",
    level: "Intermediate",
    durationWeeks: 16,
    projectCount: 8,
    rating: 4.92,
    enrolledStudents: 22800,
    tags: ["Next.js 14", "Go Microservices", "Kafka", "Docker"],
    gradient: "from-cyan-500/20 via-blue-500/20 to-violet-500/20",
    iconName: "Layers",
    description: "From pixel-perfect interactive UIs to fault-tolerant backend services with event streaming and Redis caching.",
    keySkills: ["TypeScript", "Golang", "Kubernetes", "gRPC", "PostgreSQL"],
    avgPackage: "₹18 LPA"
  },
  {
    id: "dsa-interview",
    title: "Algorithmic Mastery & System Design",
    role: "Core Software Engineer (SDE-1/2)",
    level: "Advanced",
    durationWeeks: 12,
    projectCount: 5,
    rating: 4.96,
    enrolledStudents: 31400,
    tags: ["Graph Algorithms", "Dynamic Prog", "HLD/LLD", "Concurrency"],
    gradient: "from-pink-500/20 via-rose-500/20 to-violet-500/20",
    iconName: "BrainCircuit",
    description: "Master high-frequency FAANG pattern matching, time-space optimization, and scalable high-level system architecture.",
    keySkills: ["Competitive Coding", "Distributed Cache", "Rate Limiters", "DB Sharding"],
    avgPackage: "₹28 LPA"
  },
  {
    id: "cloud-devops",
    title: "Cloud Infrastructure & SRE Operations",
    role: "Cloud Platform & DevOps Engineer",
    level: "Intermediate",
    durationWeeks: 10,
    projectCount: 5,
    rating: 4.88,
    enrolledStudents: 9800,
    tags: ["AWS", "Terraform", "CI/CD", "Prometheus"],
    gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
    iconName: "Cloud",
    description: "Design immutable multi-cloud infrastructure with Terraform, monitor with Grafana, and secure zero-trust Kubernetes clusters.",
    keySkills: ["Terraform", "ArgoCD", "AWS Architecture", "Linux Internals", "Docker"],
    avgPackage: "₹16 LPA"
  }
];

export const PLATFORM_STATS = [
  { value: "94.2%", label: "Placement Rate within 6 Months", detail: "Over 3,200 placed in 2025-2026" },
  { value: "₹21.4 LPA", label: "Average Starting CTC", detail: "Top offer ₹52 LPA at tier-1 product firm" },
  { value: "180+", label: "Verified Hiring Partners", detail: "From high-growth unicorns to MNCs" },
  { value: "4.9/5", label: "Student Learning Satisfaction", detail: "Based on 45,000+ module ratings" },
];

export const TESTIMONIALS = [
  {
    name: "Aarav Sharma",
    college: "NIT Trichy '25",
    role: "Placed as SDE at Atlassian",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    badge: "CTC ₹34 LPA",
    quote: "The 3D visualization of distributed queues and live AI mock interview feedback helped me crack the hardest rounds without anxiety."
  },
  {
    name: "Riya Verma",
    college: "DTU Delhi '25",
    role: "Placed as AI Engineer at Swiggy",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    badge: "CTC ₹26 LPA",
    quote: "I was struggling with building real RAG projects for my resume. SkillNova's interactive lab and Copilot code reviews were a complete game-changer."
  },
  {
    name: "Karan Patel",
    college: "BITS Pilani '25",
    role: "Placed as Backend Engineer at Razorpay",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    badge: "CTC ₹28 LPA",
    quote: "The system design modules with hands-on stress tests showed me how real microservices crash and recover. Can't recommend it enough!"
  }
];

export const CORE_FEATURES = [
  {
    title: "AI Study Copilot",
    description: "A contextual tutor trained on coding roadmaps. Asks Socratic questions, debugs runtime stack traces, and personalizes your daily study plan.",
    icon: "Bot",
    tag: "Autonomous AI",
    color: "violet"
  },
  {
    title: "Interactive 3D Skill Galaxy",
    description: "Explore interconnected knowledge graphs in real-time 3D. See skill prerequisites, lock statuses, and mastery nodes visually.",
    icon: "Boxes",
    tag: "Spatial Learning",
    color: "cyan"
  },
  {
    title: "Browser-Based Cloud Lab",
    description: "Zero setup required. Spin up instant micro-containers with full terminal, split diffs, and live automated test suite feedback.",
    icon: "Terminal",
    tag: "Instant Sandbox",
    color: "magenta"
  },
  {
    title: "Realistic Mock Interview Simulator",
    description: "Practice audio/video tech interviews with an AI interviewer simulating top company questions with live code execution and rubric scoring.",
    icon: "Video",
    tag: "Interview Ready",
    color: "violet"
  },
  {
    title: "ATS-Ready Resume & Portfolio Builder",
    description: "Transform completed projects into verifiable GitHub proof-of-work badges, live deployments, and recruiter-ready PDF resumes.",
    icon: "FileCheck",
    tag: "Career Velocity",
    color: "cyan"
  },
  {
    title: "Collaborative Peer Study Pods",
    description: "Join live virtual classrooms, pair program with college peers, participate in weekend hack sprints, and climb the campus leaderboard.",
    icon: "Users",
    tag: "Community",
    color: "magenta"
  }
];
