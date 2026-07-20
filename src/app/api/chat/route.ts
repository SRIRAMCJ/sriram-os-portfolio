import { NextRequest, NextResponse } from 'next/server'

const KNOWLEDGE_BASE = {
  about: `Sriram V is an AI Engineer, Machine Learning Engineer, GenAI Developer, and Computer Vision Engineer. He's currently pursuing B.Tech in AI & Data Science at Panimalar Engineering College, Chennai. Key achievements: SCOPUS Published Researcher, Multiple Hackathon Winner, 94% OCR Accuracy Achievement, 15+ AI/ML Projects Built.`,
  projects: `Sriram's featured projects:
1. Tamil Handwritten OCR - 94% accuracy, 85% manual work reduced. Tech: TensorFlow, OpenCV, Flask
2. Multi Hazard Disaster Detection - 92% accuracy with GenAI reporting. Tech: PyTorch, LangChain, FastAPI
3. Cryptocurrency Intelligence Platform - 500+ assets, 60% decision improvement. Tech: FastAPI, React, TensorFlow`,
  skills: `Technical Skills: Python (95%), TensorFlow (90%), PyTorch (88%), React (90%), Next.js (85%), FastAPI (90%), OpenCV (85%), LangChain (80%), Computer Vision (85%), Deep Learning (88%), LLMs (85%), Node.js (85%), Docker (80%), AWS (75%), SQL (80%)`,
  experience: `Work Experience:
1. Madras MindWorks - AI/ML Engineer (Jun 2024 - Present): ML models, NLP pipelines, RAG systems. 15% accuracy improvement
2. HS WebForge - Full Stack Developer (Jan 2024 - May 2024): React, Next.js, APIs. 98% client satisfaction
3. Retech Solutions - Data Science (Aug 2023 - Dec 2023): Predictive modeling, data viz. 80% automation`,
  research: `SCOPUS Publications:
1. "Advanced Tamil Handwritten Character Recognition Using Deep Learning" - 94% accuracy, 8 citations
2. "Multi-Hazard Detection Using Sensor Fusion and Generative AI" - 92% detection accuracy, 5 citations`,
  certifications: `Certifications: Oracle Cloud AI Certified, Google AI Fundamentals, Infosys AI & ML, Deep Learning Specialization (Coursera)`,
  contact: `Contact: Email: sriram@example.com | LinkedIn: linkedin.com/in/sriram | GitHub: github.com/sriram | Phone: +91 XXXXX XXXXX`,
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const lowerMessage = message.toLowerCase()
    
    let response = ''
    
    if (lowerMessage.includes('project')) {
      response = KNOWLEDGE_BASE.projects
    } else if (lowerMessage.includes('skill')) {
      response = KNOWLEDGE_BASE.skills
    } else if (lowerMessage.includes('experience') || lowerMessage.includes('work') || lowerMessage.includes('intern')) {
      response = KNOWLEDGE_BASE.experience
    } else if (lowerMessage.includes('research') || lowerMessage.includes('paper') || lowerMessage.includes('publication')) {
      response = KNOWLEDGE_BASE.research
    } else if (lowerMessage.includes('certif') || lowerMessage.includes('certificate')) {
      response = KNOWLEDGE_BASE.certifications
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('reach') || lowerMessage.includes('phone')) {
      response = KNOWLEDGE_BASE.contact
    } else if (lowerMessage.includes('about') || lowerMessage.includes('who') || lowerMessage.includes('sriram')) {
      response = KNOWLEDGE_BASE.about
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = "Hello! 👋 Welcome to SRIRAM.OS! I can tell you about Sriram's projects, skills, experience, research, certifications, or contact info. What would you like to know?"
    } else if (lowerMessage.includes('help')) {
      response = "I can help you learn about: 📁 Projects | ⚡ Skills | 💼 Experience | 🔬 Research | 🎓 Certifications | 📧 Contact | 👤 About Sriram. Just ask!"
    } else {
      response = "I'm not sure about that, but I can tell you about Sriram's projects, skills, experience, research, certifications, or how to contact him. What interests you?"
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
