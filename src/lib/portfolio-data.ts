export const aboutData = {
  name: "Sriram V",
  title: "AI Engineer | ML Engineer | GenAI Developer",
  tagline: "Building the future with Artificial Intelligence",
  email: "sriramv1592k4@gmail.com",
  phone: "+91 8838331680",
  location: "Chennai, India",
  github: "https://github.com/SRIRAMCJ",
  linkedin: "https://www.linkedin.com/in/sri-ram-v15/",
  education: {
    degree: "B.Tech AI & Data Science",
    college: "Panimalar Engineering College",
    location: "Chennai",
    year: "2022 - 2026",
  },
  careerObjective: "Passionate AI Engineer with expertise in Machine Learning, Deep Learning, Computer Vision, and Generative AI. Seeking to leverage cutting-edge AI technologies to solve real-world problems and drive innovation. Committed to continuous learning and pushing the boundaries of artificial intelligence.",
  achievements: [
    "SCOPUS Published Researcher",
    "Multiple Hackathon Winner",
    "Open Source Contributor",
    "AI Community Leader",
    "94% OCR Accuracy Achievement",
    "Built 15+ AI/ML Projects",
  ],
  leadership: [
    "Led cross-functional teams in hackathons",
    "Mentored junior developers in AI/ML",
    "Organized tech workshops and seminars",
    "Contributed to open-source AI libraries",
  ],
  softSkills: [
    "Problem Solving",
    "Critical Thinking",
    "Team Collaboration",
    "Communication",
    "Adaptability",
    "Time Management",
    "Creative Thinking",
    "Leadership",
  ],
}

export const experienceData = [
  {
    id: 1,
    company: "Madras MindWorks",
    role: "AI/ML Engineer Intern",
    duration: "Jun 2024 - Present",
    location: "Chennai",
    type: "Internship",
    responsibilities: [
      "Developed and deployed ML models for production systems",
      "Built NLP pipelines for text classification and entity extraction",
      "Implemented RAG-based systems using LangChain and vector databases",
      "Optimized model inference for real-time applications",
    ],
    tech: ["Python", "TensorFlow", "LangChain", "FastAPI", "Docker", "AWS"],
    impact: "Improved model accuracy by 15% and reduced inference time by 40%",
    color: "#00E5FF",
  },
  {
    id: 2,
    company: "HS WebForge",
    role: "Full Stack Developer Intern",
    duration: "Jan 2024 - May 2024",
    location: "Remote",
    type: "Internship",
    responsibilities: [
      "Built responsive web applications using React and Next.js",
      "Developed RESTful APIs with Node.js and Express",
      "Implemented authentication and authorization systems",
      "Integrated third-party APIs and payment gateways",
    ],
    tech: ["React", "Next.js", "Node.js", "MongoDB", "TypeScript", "Tailwind CSS"],
    impact: "Delivered 5 production-ready features with 98% client satisfaction",
    color: "#6C63FF",
  },
  {
    id: 3,
    company: "Retech Solutions",
    role: "Data Science Intern",
    duration: "Aug 2023 - Dec 2023",
    location: "Chennai",
    type: "Internship",
    responsibilities: [
      "Performed exploratory data analysis on large datasets",
      "Built predictive models using scikit-learn and XGBoost",
      "Created data visualization dashboards with Plotly",
      "Automated data pipeline processes",
    ],
    tech: ["Python", "Pandas", "Scikit-learn", "Plotly", "SQL", "Jupyter"],
    impact: "Automated 80% of manual data processing tasks",
    color: "#FF00C8",
  },
]

export const projectsData = [
  {
    id: 1,
    title: "Tamil Handwritten OCR",
    description: "Advanced OCR system for Tamil handwritten text recognition using deep learning",
    overview: "Built a state-of-the-art Optical Character Recognition system specifically designed for Tamil handwritten documents, achieving industry-leading accuracy through novel architecture design.",
    problem: "Tamil script recognition posed significant challenges due to complex character morphology, varied handwriting styles, and lack of quality training data.",
    architecture: "CNN + LSTM + CTC Loss pipeline with attention mechanism and data augmentation",
    techStack: ["Python", "TensorFlow", "OpenCV", "Flask", "React", "Docker"],
    metrics: { accuracy: "94%", manualWorkReduced: "85%", processingSpeed: "2x faster" },
    highlights: [
      "94% character recognition accuracy",
      "Reduced manual data entry by 85%",
      "Handles complex Tamil ligatures",
      "Real-time processing capability",
    ],
    lessons: "Data augmentation and domain-specific preprocessing are crucial for low-resource language OCR",
    futureImprovements: ["Extend to other Indic scripts", "Add real-time video OCR", "Mobile app deployment"],
    github: "https://github.com/sriram/tamil-ocr",
    demo: "#",
    color: "#00E5FF",
    icon: "🔍",
  },
  {
    id: 2,
    title: "Multi Hazard Disaster Detection",
    description: "AI-powered multi-hazard detection and GenAI reporting system",
    overview: "Comprehensive disaster detection system that monitors multiple hazard types simultaneously and generates automated reports using Generative AI.",
    problem: "Traditional disaster monitoring systems are siloed, slow, and lack automated reporting capabilities for rapid response coordination.",
    architecture: "Multi-modal sensor fusion with CNN-based detection and LLM-powered report generation",
    techStack: ["Python", "PyTorch", "OpenCV", "LangChain", "FastAPI", "React"],
    metrics: { accuracy: "92%", detectionSpeed: "< 3 seconds", reportGeneration: "Automated" },
    highlights: [
      "92% hazard detection accuracy",
      "Multi-hazard simultaneous monitoring",
      "GenAI automated report generation",
      "Real-time alert system",
    ],
    lessons: "Multi-modal data fusion significantly improves detection reliability over single-source approaches",
    futureImprovements: ["Satellite imagery integration", "Predictive analytics", "Drone-based monitoring"],
    github: "https://github.com/sriram/disaster-detection",
    demo: "#",
    color: "#FF6B35",
    icon: "🚨",
  },
  {
    id: 3,
    title: "Cryptocurrency Intelligence Platform",
    description: "Real-time crypto analytics with AI-driven insights and predictive modeling",
    overview: "Full-stack platform providing real-time cryptocurrency market intelligence, sentiment analysis, and AI-powered trading signals for 500+ digital assets.",
    problem: "Crypto markets are highly volatile and traders need comprehensive, real-time intelligence that combines technical, fundamental, and sentiment analysis.",
    architecture: "Microservices architecture with real-time data streaming, ML prediction engine, and interactive dashboard",
    techStack: ["Python", "FastAPI", "React", "PostgreSQL", "Redis", "TensorFlow", "WebSocket"],
    metrics: { assets: "500+", decisionImprovement: "60%", uptime: "99.9%" },
    highlights: [
      "500+ cryptocurrency assets tracked",
      "60% improvement in decision-making",
      "Real-time sentiment analysis",
      "AI-powered price predictions",
    ],
    lessons: "Real-time data pipelines and caching strategies are essential for high-frequency financial applications",
    futureImprovements: ["DeFi integration", "Portfolio optimization AI", "Social trading features"],
    github: "https://github.com/sriram/crypto-intel",
    demo: "#",
    color: "#FFD700",
    icon: "₿",
  },
]

export const skillsData = {
  languages: [
    { name: "Python", level: 95, color: "#3776AB" },
    { name: "JavaScript", level: 85, color: "#F7DF1E" },
    { name: "TypeScript", level: 80, color: "#3178C6" },
    { name: "Java", level: 75, color: "#ED8B00" },
    { name: "SQL", level: 80, color: "#4479A1" },
  ],
  frontend: [
    { name: "React", level: 90, color: "#61DAFB" },
    { name: "Next.js", level: 85, color: "#FFFFFF" },
    { name: "Tailwind CSS", level: 90, color: "#06B6D4" },
    { name: "HTML/CSS", level: 95, color: "#E34F26" },
  ],
  backend: [
    { name: "Node.js", level: 85, color: "#339933" },
    { name: "FastAPI", level: 90, color: "#009688" },
    { name: "Django", level: 75, color: "#092E20" },
    { name: "Flask", level: 85, color: "#FFFFFF" },
  ],
  ai_ml: [
    { name: "TensorFlow", level: 90, color: "#FF6F00" },
    { name: "PyTorch", level: 88, color: "#EE4C2C" },
    { name: "OpenCV", level: 85, color: "#5C3EE8" },
    { name: "Computer Vision", level: 85, color: "#00E5FF" },
    { name: "Deep Learning", level: 88, color: "#6C63FF" },
    { name: "LLMs", level: 85, color: "#FF00C8" },
    { name: "LangChain", level: 80, color: "#1C3C3C" },
    { name: "RAG", level: 82, color: "#00FF88" },
    { name: "Vector Databases", level: 78, color: "#FFD700" },
  ],
  databases: [
    { name: "MongoDB", level: 80, color: "#47A248" },
    { name: "PostgreSQL", level: 82, color: "#4169E1" },
    { name: "MySQL", level: 78, color: "#4479A1" },
    { name: "Redis", level: 70, color: "#DC382D" },
  ],
  devops: [
    { name: "Docker", level: 80, color: "#2496ED" },
    { name: "AWS", level: 75, color: "#FF9900" },
    { name: "Git", level: 90, color: "#F05032" },
    { name: "GitHub", level: 92, color: "#FFFFFF" },
    { name: "Linux", level: 85, color: "#FCC624" },
  ],
}

export const certificationsData = [
  {
    title: "Oracle Cloud AI Certified Associate",
    issuer: "Oracle",
    date: "2024",
    credentialId: "OCA-AI-2024",
    color: "#F80000",
    icon: "☁️",
  },
  {
    title: "Google AI Fundamentals",
    issuer: "Google",
    date: "2024",
    credentialId: "GOOG-AI-2024",
    color: "#4285F4",
    icon: "🧠",
  },
  {
    title: "Infosys AI & ML Certification",
    issuer: "Infosys",
    date: "2023",
    credentialId: "INFY-AIML-2023",
    color: "#007CC3",
    icon: "🎓",
  },
  {
    title: "Deep Learning Specialization",
    issuer: "Coursera (Andrew Ng)",
    date: "2023",
    credentialId: "DL-SPEC-2023",
    color: "#00B4D8",
    icon: "🤖",
  },
]

export const researchData = [
  {
    title: "Advanced Tamil Handwritten Character Recognition Using Deep Learning",
    abstract: "This paper presents a novel approach to Tamil handwritten character recognition using a hybrid CNN-LSTM architecture with attention mechanisms. The proposed system achieves 94% accuracy on a custom dataset, outperforming existing methods by 12%. Key innovations include data augmentation strategies specific to Tamil script and a novel loss function for handling class imbalance.",
    doi: "10.xxxx/xxxxx",
    year: "2024",
    type: "SCOPUS",
    citations: 8,
    color: "#00E5FF",
  },
  {
    title: "Multi-Hazard Detection Using Sensor Fusion and Generative AI",
    abstract: "We propose a multi-hazard detection framework that fuses data from multiple sensor modalities and employs Generative AI for automated report generation. The system demonstrates 92% detection accuracy across earthquake, flood, and fire hazards while reducing response time by 60%.",
    doi: "10.xxxx/xxxxx2",
    year: "2024",
    type: "SCOPUS",
    citations: 5,
    color: "#6C63FF",
  },
]

export const achievementsData = [
  { title: "Hackathon Winner", description: "1st Place - National AI Hackathon 2024", icon: "🏆", color: "#FFD700" },
  { title: "SCOPUS Publication", description: "2 Research Papers Published", icon: "📄", color: "#00E5FF" },
  { title: "Open Source", description: "500+ GitHub Contributions", icon: "⭐", color: "#6C63FF" },
  { title: "Community Leader", description: "AI/ML Community Organizer", icon: "👥", color: "#FF00C8" },
  { title: "Certified AI Pro", description: "Oracle + Google Certified", icon: "🎓", color: "#00FF88" },
  { title: "Innovation Award", description: "Best Student Project Award 2024", icon: "💡", color: "#FF6B35" },
]

export const terminalCommands: Record<string, string> = {
  help: `Available Commands:
  about       - About Sriram V
  skills      - View technical skills
  projects    - View projects
  research    - View research papers
  experience  - View work experience
  resume      - Download resume
  contact     - Contact information
  github      - Open GitHub profile
  linkedin    - Open LinkedIn profile
  whoami      - Who are you?
  ls          - List directories
  cat         - Read file contents
  clear       - Clear terminal
  theme       - Cycle theme
  fortune     - Random fortune
  matrix      - Matrix rain effect
  ascii       - ASCII art
  sudo        - Try it ;)
  open        - Open a section`,
  about: `
╔══════════════════════════════════════╗
║          SRIRAM V                     ║
║   AI Engineer | ML Developer          ║
║   GenAI | Computer Vision             ║
╚══════════════════════════════════════╝

🎓 B.Tech AI & Data Science
📍 Panimalar Engineering College, Chennai

🚀 Career Objective:
Passionate AI Engineer building the future 
with Artificial Intelligence. Expertise in 
Machine Learning, Deep Learning, Computer 
Vision, and Generative AI.

⭐ Key Achievements:
  • SCOPUS Published Researcher
  • Multiple Hackathon Winner
  • 94% OCR Accuracy Achievement
  • 15+ AI/ML Projects Built`,
  skills: `
┌─ Languages ─────────────────────┐
│ Python     ████████████████░ 95%│
│ JavaScript ██████████████░░ 85% │
│ TypeScript ████████████░░░ 80%  │
│ Java       ██████████░░░░░ 75%  │
