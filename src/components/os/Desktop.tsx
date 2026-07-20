'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOSStore, type WindowId } from '@/store/useOSStore'
import { useSound } from '@/hooks/useSound'
import { useKonamiCode } from '@/hooks/useKonamiCode'
import PixelWorld from '@/components/world/PixelWorld'
import Window from '@/components/os/Window'
import Terminal from '@/components/terminal/Terminal'
import AIAssistant from '@/components/assistant/AIAssistant'
import {
  aboutData,
  experienceData,
  projectsData,
  skillsData,
  certificationsData,
  researchData,
  achievementsData,
} from '@/lib/portfolio-data'

// ─── Colors ──────────────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#050816',
  primary: '#00E5FF',
  secondary: '#6C63FF',
  accent: '#FF00C8',
  text: '#FFFFFF',
  muted: '#94A3B8',
  green: '#00FF88',
  yellow: '#FFD700',
  orange: '#FF6B35',
}

// ─── Building ID → Window ID mapping ────────────────────────────────────────────

const BUILDING_TO_WINDOW: Record<string, WindowId> = {
  'ai-lab': 'about',
  'projects': 'projects',
  'experience': 'experience',
  'skills': 'skills',
  'research': 'research',
  'contact': 'contact',
}

// ─── Window config data ──────────────────────────────────────────────────────────

interface WindowConfig {
  id: WindowId
  title: string
  icon: string
  color: string
  width: number
  height: number
}

const WINDOW_CONFIGS: WindowConfig[] = [
  { id: 'about', title: 'About Me', icon: '🤖', color: '#00E5FF', width: 680, height: 520 },
  { id: 'experience', title: 'Experience', icon: '💼', color: '#FF00C8', width: 720, height: 540 },
  { id: 'projects', title: 'Projects', icon: '🚀', color: '#6C63FF', width: 740, height: 560 },
  { id: 'skills', title: 'Skills', icon: '⚡', color: '#00FF88', width: 720, height: 560 },
  { id: 'certifications', title: 'Certifications', icon: '🎓', color: '#00B4D8', width: 680, height: 480 },
  { id: 'research', title: 'Research', icon: '🔬', color: '#FFD700', width: 700, height: 500 },
  { id: 'resume', title: 'Resume', icon: '📄', color: '#94A3B8', width: 600, height: 460 },
  { id: 'contact', title: 'Contact', icon: '📡', color: '#FF6B35', width: 600, height: 480 },
  { id: 'terminal', title: 'Terminal', icon: '💻', color: '#00E5FF', width: 700, height: 480 },
  { id: 'achievements', title: 'Achievements', icon: '🏆', color: '#FFD700', width: 660, height: 480 },
  { id: 'secret', title: '⛔ Secret Room', icon: '🔒', color: '#FF00C8', width: 600, height: 440 },
  { id: 'snake', title: 'Snake Game', icon: '🐍', color: '#00FF88', width: 500, height: 500 },
  { id: 'settings', title: 'Settings', icon: '⚙️', color: '#94A3B8', width: 560, height: 440 },
]

function getWindowConfig(id: WindowId): WindowConfig {
  return WINDOW_CONFIGS.find(c => c.id === id) || WINDOW_CONFIGS[0]
}

// ─── Section Header Component ────────────────────────────────────────────────────

function SectionHeader({ title, icon, color, subtitle }: { title: string; icon: string; color: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <motion.div
        className="flex items-center gap-3 mb-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-2xl">{icon}</span>
        <h2
          className="font-orbitron text-lg font-bold tracking-wide"
          style={{ color, textShadow: `0 0 10px ${color}40` }}
        >
          {title}
        </h2>
        <motion.div
          className="flex-1 h-px"
          style={{ background: `linear-gradient(90deg, ${color}40, transparent)` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
      </motion.div>
      {subtitle && (
        <motion.p
          className="font-jetbrains text-xs pl-10"
          style={{ color: COLORS.muted }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}

// ─── Glass Card Component ────────────────────────────────────────────────────────

function GlassCard({ children, color, className = '', delay = 0 }: { children: React.ReactNode; color?: string; className?: string; delay?: number }) {
  return (
    <motion.div
      className={`rounded-lg p-4 ${className}`}
      style={{
        background: 'rgba(10, 15, 40, 0.6)',
        backdropFilter: 'blur(8px)',
        border: color ? `1px solid ${color}25` : '1px solid rgba(148,163,184,0.1)',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  )
}

// ─── About Section ───────────────────────────────────────────────────────────────

function AboutSection() {
  return (
    <div className="p-5 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="About Me" icon="🤖" color={COLORS.primary} subtitle="AI Engineer | ML Engineer | GenAI Developer" />

      <div className="space-y-4">
        {/* Profile Card */}
        <GlassCard color={COLORS.primary}>
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl shrink-0"
              style={{ background: `linear-gradient(135deg, ${COLORS.primary}30, ${COLORS.secondary}30)`, border: `1px solid ${COLORS.primary}30` }}
            >
              🧠
            </div>
            <div>
              <h3 className="font-orbitron text-base font-bold" style={{ color: COLORS.primary }}>
                {aboutData.name}
              </h3>
              <p className="font-jetbrains text-xs mt-1" style={{ color: COLORS.muted }}>
                {aboutData.title}
              </p>
              <p className="font-jetbrains text-xs mt-1" style={{ color: COLORS.accent }}>
                {aboutData.tagline}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Career Objective */}
        <GlassCard color={COLORS.secondary} delay={0.1}>
          <h4 className="font-orbitron text-xs font-semibold mb-2" style={{ color: COLORS.secondary }}>
            🚀 Career Objective
          </h4>
          <p className="font-jetbrains text-xs leading-relaxed" style={{ color: COLORS.muted }}>
            {aboutData.careerObjective}
          </p>
        </GlassCard>

        {/* Education */}
        <GlassCard color={COLORS.green} delay={0.15}>
          <h4 className="font-orbitron text-xs font-semibold mb-2" style={{ color: COLORS.green }}>
            🎓 Education
          </h4>
          <p className="font-jetbrains text-sm font-medium" style={{ color: COLORS.text }}>
            {aboutData.education.degree}
          </p>
          <p className="font-jetbrains text-xs" style={{ color: COLORS.muted }}>
            {aboutData.education.college}, {aboutData.education.location}
          </p>
          <p className="font-jetbrains text-xs" style={{ color: COLORS.primary }}>
            {aboutData.education.year}
          </p>
        </GlassCard>

        {/* Achievements */}
        <GlassCard color={COLORS.yellow} delay={0.2}>
          <h4 className="font-orbitron text-xs font-semibold mb-2" style={{ color: COLORS.yellow }}>
            ⭐ Key Achievements
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {aboutData.achievements.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs" style={{ color: COLORS.primary }}>▹</span>
                <span className="font-jetbrains text-xs" style={{ color: COLORS.muted }}>{a}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Soft Skills */}
        <GlassCard color={COLORS.accent} delay={0.25}>
          <h4 className="font-orbitron text-xs font-semibold mb-2" style={{ color: COLORS.accent }}>
            💡 Soft Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {aboutData.softSkills.map((s, i) => (
              <span
                key={i}
                className="font-jetbrains text-[10px] px-2 py-1 rounded-full"
                style={{ background: `${COLORS.accent}15`, color: COLORS.accent, border: `1px solid ${COLORS.accent}30` }}
              >
                {s}
              </span>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

// ─── Experience Section (Timeline) ───────────────────────────────────────────────

function ExperienceSection() {
  return (
    <div className="p-5 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="Experience" icon="💼" color={COLORS.accent} subtitle="Professional journey & internships" />

      <div className="relative">
        {/* Timeline line */}
        <div
          className="absolute left-4 top-0 bottom-0 w-px"
          style={{ background: `linear-gradient(180deg, ${COLORS.accent}60, ${COLORS.secondary}60, transparent)` }}
        />

        <div className="space-y-5">
          {experienceData.map((exp, idx) => (
            <motion.div
              key={exp.id}
              className="relative pl-10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
            >
              {/* Timeline dot */}
              <div
                className="absolute left-2.5 top-3 w-3 h-3 rounded-full"
                style={{
                  background: exp.color,
                  boxShadow: `0 0 8px ${exp.color}60`,
                }}
              />

              <GlassCard color={exp.color} delay={idx * 0.1}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-orbitron text-sm font-bold" style={{ color: exp.color }}>
                      {exp.role}
                    </h3>
                    <p className="font-jetbrains text-xs" style={{ color: COLORS.text }}>
                      {exp.company}
                    </p>
                  </div>
                  <span
                    className="font-jetbrains text-[10px] px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: `${exp.color}20`, color: exp.color, border: `1px solid ${exp.color}30` }}
                  >
                    {exp.type}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3 font-jetbrains text-[10px]" style={{ color: COLORS.muted }}>
                  <span>📅 {exp.duration}</span>
                  <span>📍 {exp.location}</span>
                </div>

                <ul className="space-y-1.5 mb-3">
                  {exp.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs" style={{ color: exp.color }}>▹</span>
                      <span className="font-jetbrains text-xs" style={{ color: COLORS.muted }}>{r}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {exp.tech.map((t, i) => (
                    <span
                      key={i}
                      className="font-jetbrains text-[9px] px-1.5 py-0.5 rounded"
                      style={{ background: `${exp.color}15`, color: exp.color }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div
                  className="font-jetbrains text-[10px] px-2 py-1.5 rounded mt-2"
                  style={{ background: `${COLORS.green}10`, border: `1px solid ${COLORS.green}20`, color: COLORS.green }}
                >
                  📈 Impact: {exp.impact}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Projects Section (Expandable Cards) ─────────────────────────────────────────

function ProjectsSection() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div className="p-5 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="Projects" icon="🚀" color={COLORS.secondary} subtitle="Featured AI/ML projects" />

      <div className="space-y-4">
        {projectsData.map((project, idx) => {
          const isExpanded = expandedId === project.id
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.12 }}
            >
              <GlassCard
                color={project.color}
                className="cursor-pointer"
                delay={idx * 0.08}
              >
                {/* Header row */}
                <div
                  className="flex items-center justify-between"
                  onClick={() => setExpandedId(isExpanded ? null : project.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{project.icon}</span>
                    <div>
                      <h3 className="font-orbitron text-sm font-bold" style={{ color: project.color }}>
                        {project.title}
                      </h3>
                      <p className="font-jetbrains text-xs" style={{ color: COLORS.muted }}>
                        {project.description}
                      </p>
                    </div>
                  </div>
                  <motion.span
                    className="font-jetbrains text-lg"
                    style={{ color: project.color }}
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▾
                  </motion.span>
                </div>

                {/* Metrics bar */}
                <div className="flex items-center gap-3 mt-3">
                  {Object.entries(project.metrics).map(([key, value]) => (
                    <div
                      key={key}
                      className="font-jetbrains text-[10px] px-2 py-1 rounded"
                      style={{ background: `${project.color}15`, color: project.color, border: `1px solid ${project.color}20` }}
                    >
                      {key.replace(/([A-Z])/g, ' $1').trim()}: <span className="font-semibold">{String(value)}</span>
                    </div>
                  ))}
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 space-y-3" style={{ borderTop: `1px solid ${project.color}20` }}>
                        <div>
                          <h4 className="font-orbitron text-[10px] font-semibold mb-1" style={{ color: project.color }}>
                            OVERVIEW
                          </h4>
                          <p className="font-jetbrains text-xs" style={{ color: COLORS.muted }}>{project.overview}</p>
                        </div>
                        <div>
                          <h4 className="font-orbitron text-[10px] font-semibold mb-1" style={{ color: project.color }}>
                            PROBLEM
                          </h4>
                          <p className="font-jetbrains text-xs" style={{ color: COLORS.muted }}>{project.problem}</p>
                        </div>
                        <div>
                          <h4 className="font-orbitron text-[10px] font-semibold mb-1" style={{ color: project.color }}>
                            ARCHITECTURE
                          </h4>
                          <p className="font-jetbrains text-xs" style={{ color: COLORS.muted }}>{project.architecture}</p>
                        </div>
                        <div>
                          <h4 className="font-orbitron text-[10px] font-semibold mb-1" style={{ color: project.color }}>
                            HIGHLIGHTS
                          </h4>
                          <ul className="space-y-1">
                            {project.highlights.map((h, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="text-xs" style={{ color: COLORS.green }}>✓</span>
                                <span className="font-jetbrains text-xs" style={{ color: COLORS.muted }}>{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {project.techStack.map((t, i) => (
                            <span
                              key={i}
                              className="font-jetbrains text-[9px] px-1.5 py-0.5 rounded"
                              style={{ background: `${project.color}15`, color: project.color }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <div
                          className="font-jetbrains text-[10px] px-2 py-1.5 rounded"
                          style={{ background: `${COLORS.yellow}10`, border: `1px solid ${COLORS.yellow}20`, color: COLORS.yellow }}
                        >
                          💡 Lessons: {project.lessons}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Skills Section (Tech Tree) ──────────────────────────────────────────────────

function SkillsSection() {
  const [activeCategory, setActiveCategory] = useState<string>('ai_ml')

  const categories = [
    { key: 'ai_ml', label: 'AI / ML', color: '#00E5FF', icon: '🧠' },
    { key: 'languages', label: 'Languages', color: '#3776AB', icon: '🐍' },
    { key: 'frontend', label: 'Frontend', color: '#61DAFB', icon: '⚛️' },
    { key: 'backend', label: 'Backend', color: '#339933', icon: '🔧' },
    { key: 'databases', label: 'Databases', color: '#47A248', icon: '🗄️' },
    { key: 'devops', label: 'DevOps', color: '#2496ED', icon: '🐳' },
  ]

  const currentSkills = skillsData[activeCategory as keyof typeof skillsData] || []

  return (
    <div className="p-5 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="Skills" icon="⚡" color={COLORS.green} subtitle="Interactive tech tree" />

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {categories.map((cat) => (
          <button
            key={cat.key}
            className="font-jetbrains text-[10px] px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{
              background: activeCategory === cat.key ? `${cat.color}20` : 'rgba(148,163,184,0.05)',
              color: activeCategory === cat.key ? cat.color : COLORS.muted,
              border: `1px solid ${activeCategory === cat.key ? cat.color + '40' : 'rgba(148,163,184,0.1)'}`,
              boxShadow: activeCategory === cat.key ? `0 0 10px ${cat.color}20` : 'none',
            }}
            onClick={() => setActiveCategory(cat.key)}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Skills tree */}
      <div className="relative">
        {/* Connection line from center */}
        <div
          className="absolute left-6 top-0 bottom-0 w-px"
          style={{
            background: `linear-gradient(180deg, ${categories.find(c => c.key === activeCategory)?.color || COLORS.green}40, transparent)`,
          }}
        />

        <div className="space-y-3">
          {(currentSkills as Array<{ name: string; level: number; color: string }>).map((skill, idx) => (
            <motion.div
              key={skill.name}
              className="relative pl-12"
              style={{ transition: 'transform 0.3s ease, filter 0.3s ease' }}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
            >
              {/* Node connector */}
              <div
                className="absolute left-4 top-3.5 w-3 h-3 rounded-full border-2"
                style={{
                  borderColor: skill.color,
                  background: `${skill.color}30`,
                  boxShadow: `0 0 6px ${skill.color}40`,
                }}
              />

              <div
                className="rounded-lg p-3"
                style={{
                  background: 'rgba(10, 15, 40, 0.5)',
                  border: `1px solid ${skill.color}20`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-jetbrains text-xs font-medium" style={{ color: skill.color }}>
                    {skill.name}
                  </span>
                  <span className="font-jetbrains text-[10px]" style={{ color: COLORS.muted }}>
                    {skill.level}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${skill.color}15` }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${skill.color}, ${skill.color}CC)`,
                      boxShadow: `0 0 8px ${skill.color}40`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.06 + 0.2, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Certifications Section ──────────────────────────────────────────────────────

function CertificationsSection() {
  return (
    <div className="p-5 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="Certifications" icon="🎓" color="#00B4D8" subtitle="Professional certifications & credentials" />

      <div className="grid grid-cols-2 gap-3">
        {certificationsData.map((cert, idx) => (
          <motion.div
            key={cert.credentialId}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
          >
            <GlassCard color={cert.color} delay={idx * 0.05}>
              <div className="text-center">
                <span className="text-3xl block mb-2">{cert.icon}</span>
                <h3 className="font-orbitron text-[11px] font-bold mb-1" style={{ color: cert.color }}>
                  {cert.title}
                </h3>
                <p className="font-jetbrains text-[10px]" style={{ color: COLORS.muted }}>
                  {cert.issuer}
                </p>
                <div
                  className="font-jetbrains text-[9px] mt-2 px-2 py-0.5 rounded-full inline-block"
                  style={{ background: `${cert.color}15`, color: cert.color, border: `1px solid ${cert.color}25` }}
                >
                  {cert.date} • {cert.credentialId}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Research Section ────────────────────────────────────────────────────────────

function ResearchSection() {
  return (
    <div className="p-5 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="Research" icon="🔬" color={COLORS.yellow} subtitle="SCOPUS indexed publications" />

      <div className="space-y-4">
        {researchData.map((paper, idx) => (
          <motion.div
            key={paper.doi}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.15 }}
          >
            <GlassCard color={paper.color} delay={idx * 0.05}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-orbitron text-xs font-bold leading-tight" style={{ color: paper.color }}>
                    {paper.title}
                  </h3>
                </div>
                <span
                  className="font-jetbrains text-[9px] px-2 py-0.5 rounded-full shrink-0 ml-2"
                  style={{ background: `${paper.color}20`, color: paper.color, border: `1px solid ${paper.color}30` }}
                >
                  {paper.type}
                </span>
              </div>
              <p className="font-jetbrains text-xs leading-relaxed mb-3" style={{ color: COLORS.muted }}>
                {paper.abstract}
              </p>
              <div className="flex items-center gap-4 font-jetbrains text-[10px]" style={{ color: COLORS.muted }}>
                <span>📅 {paper.year}</span>
                <span>📖 {paper.citations} citations</span>
                <span style={{ color: paper.color }}>DOI: {paper.doi}</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Resume Section ──────────────────────────────────────────────────────────────

function ResumeSection() {
  return (
    <div className="p-5 h-full flex flex-col items-center justify-center">
      <SectionHeader title="Resume" icon="📄" color={COLORS.muted} subtitle="Download my full resume" />
      <motion.div
        className="flex flex-col items-center gap-6 mt-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="w-32 h-40 rounded-lg flex items-center justify-center"
          style={{
            background: 'rgba(10, 15, 40, 0.6)',
            border: '1px dashed rgba(148,163,184,0.3)',
          }}
        >
          <span className="text-5xl opacity-30">📄</span>
        </div>
        <button
          className="font-orbitron text-xs px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
            color: COLORS.bg,
            boxShadow: `0 0 20px ${COLORS.primary}30`,
          }}
        >
          ⬇ Download Resume
        </button>
        <p className="font-jetbrains text-[10px]" style={{ color: COLORS.muted }}>
          PDF format • Updated 2024
        </p>
      </motion.div>
    </div>
  )
}

// ─── Contact Section ─────────────────────────────────────────────────────────────

function ContactSection() {
  const contacts = [
    { icon: '📧', label: 'Email', value: aboutData.email, color: COLORS.primary },
    { icon: '💼', label: 'LinkedIn', value: aboutData.linkedin, color: '#0077B5' },
    { icon: '🐙', label: 'GitHub', value: aboutData.github, color: '#FFFFFF' },
    { icon: '🌐', label: 'Portfolio', value: aboutData.portfolio, color: COLORS.secondary },
    { icon: '📱', label: 'Phone', value: aboutData.phone, color: COLORS.green },
    { icon: '📍', label: 'Location', value: aboutData.location, color: COLORS.orange },
  ]

  return (
    <div className="p-5 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="Contact" icon="📡" color={COLORS.orange} subtitle="Get in touch" />

      <div className="grid grid-cols-2 gap-3">
        {contacts.map((c, idx) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
          >
            <GlassCard color={c.color} delay={idx * 0.03} className="hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{c.icon}</span>
                <span className="font-orbitron text-[10px] font-semibold" style={{ color: c.color }}>
                  {c.label}
                </span>
              </div>
              <p className="font-jetbrains text-xs break-all" style={{ color: COLORS.muted }}>
                {c.value}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Achievements Section ────────────────────────────────────────────────────────

function AchievementsSection() {
  return (
    <div className="p-5 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="Achievements" icon="🏆" color={COLORS.yellow} subtitle="Milestones & accolades" />

      <div className="grid grid-cols-2 gap-3">
        {achievementsData.map((a, idx) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
          >
            <GlassCard color={a.color} delay={idx * 0.04}>
              <div className="text-center">
                <span className="text-3xl block mb-2">{a.icon}</span>
                <h3 className="font-orbitron text-[11px] font-bold mb-1" style={{ color: a.color }}>
                  {a.title}
                </h3>
                <p className="font-jetbrains text-[10px]" style={{ color: COLORS.muted }}>
                  {a.description}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Secret Section ──────────────────────────────────────────────────────────────

function SecretSection() {
  const secretUnlocked = useOSStore(s => s.secretUnlocked)
  const unlockSecret = useOSStore(s => s.unlockSecret)

  return (
    <div className="p-5 h-full flex flex-col items-center justify-center">
      {!secretUnlocked ? (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-6xl block mb-4">🔒</span>
          <h3 className="font-orbitron text-lg font-bold mb-2" style={{ color: COLORS.accent }}>
            Access Denied
          </h3>
          <p className="font-jetbrains text-xs mb-4" style={{ color: COLORS.muted }}>
            You need the Konami code to enter
          </p>
          <p className="font-jetbrains text-[10px]" style={{ color: COLORS.accent }}>
            Hint: ↑↑↓↓←→←→BA
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <span className="text-6xl block mb-4">🔓</span>
          <h3 className="font-orbitron text-lg font-bold mb-2" style={{ color: COLORS.green }}>
            Secret Room Unlocked!
          </h3>
          <GlassCard color={COLORS.green}>
            <p className="font-jetbrains text-xs" style={{ color: COLORS.muted }}>
              🎉 You found the secret! You are a true hacker. The AI future belongs to the curious.
            </p>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}

// ─── Snake Section ───────────────────────────────────────────────────────────────

function SnakeSection() {
  return (
    <div className="p-5 h-full flex flex-col items-center justify-center">
      <SectionHeader title="Snake Game" icon="🐍" color={COLORS.green} subtitle="Classic arcade fun" />
      <div
        className="mt-4 w-80 h-64 rounded-lg flex items-center justify-center"
        style={{
          background: 'rgba(10, 15, 40, 0.6)',
          border: `1px dashed ${COLORS.green}30`,
        }}
      >
        <div className="text-center">
          <span className="text-5xl block mb-3">🐍</span>
          <p className="font-orbitron text-sm font-bold" style={{ color: COLORS.green }}>
            Coming Soon
          </p>
          <p className="font-jetbrains text-xs mt-1" style={{ color: COLORS.muted }}>
            The snake is still evolving...
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Settings Section ────────────────────────────────────────────────────────────

function SettingsSection() {
  const { soundEnabled, toggleSound, showParticles, toggleParticles } = useOSStore()

  const settings = [
    { icon: '🔊', label: 'Sound Effects', value: soundEnabled, onToggle: toggleSound, color: COLORS.primary },
    { icon: '✨', label: 'Particles', value: showParticles, onToggle: toggleParticles, color: COLORS.secondary },
  ]

  return (
    <div className="p-5 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="Settings" icon="⚙️" color={COLORS.muted} subtitle="System preferences" />

      <div className="space-y-3">
        {settings.map((s, idx) => (
          <GlassCard key={s.label} color={s.color} delay={idx * 0.05}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">{s.icon}</span>
                <span className="font-jetbrains text-sm" style={{ color: COLORS.text }}>
                  {s.label}
                </span>
              </div>
              <button
                className="w-10 h-5 rounded-full transition-all duration-200 relative"
                style={{
                  background: s.value ? `${s.color}40` : 'rgba(148,163,184,0.2)',
                  border: `1px solid ${s.value ? s.color + '60' : 'rgba(148,163,184,0.2)'}`,
                }}
                onClick={s.onToggle}
              >
                <motion.div
                  className="absolute top-0.5 w-3.5 h-3.5 rounded-full"
                  style={{
                    background: s.value ? s.color : COLORS.muted,
                    boxShadow: s.value ? `0 0 6px ${s.color}60` : 'none',
                  }}
                  animate={{ left: s.value ? '22px' : '2px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </GlassCard>
        ))}

        <GlassCard color={COLORS.accent} delay={0.15}>
          <div className="text-center">
            <span className="text-2xl">🤖</span>
            <h4 className="font-orbitron text-xs font-semibold mt-2" style={{ color: COLORS.accent }}>
              SRIRAM.OS v3.0
            </h4>
            <p className="font-jetbrains text-[10px] mt-1" style={{ color: COLORS.muted }}>
              AI Operating System Portfolio
            </p>
            <p className="font-jetbrains text-[9px] mt-1" style={{ color: COLORS.muted }}>
              Built with Next.js, TypeScript & Framer Motion
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

// ─── Window Content Mapper ───────────────────────────────────────────────────────

function WindowContent({ windowId }: { windowId: WindowId }) {
  switch (windowId) {
    case 'about': return <AboutSection />
    case 'experience': return <ExperienceSection />
    case 'projects': return <ProjectsSection />
    case 'skills': return <SkillsSection />
    case 'certifications': return <CertificationsSection />
    case 'research': return <ResearchSection />
    case 'resume': return <ResumeSection />
    case 'contact': return <ContactSection />
    case 'terminal': return <Terminal />
    case 'achievements': return <AchievementsSection />
    case 'secret': return <SecretSection />
    case 'snake': return <SnakeSection />
    case 'settings': return <SettingsSection />
    default: return <div className="p-5 font-jetbrains text-sm" style={{ color: COLORS.muted }}>Content not found</div>
  }
}

// ─── Start Menu ──────────────────────────────────────────────────────────────────

function StartMenu({ isOpen, onClose, onOpenWindow }: {
  isOpen: boolean
  onClose: () => void
  onOpenWindow: (id: WindowId) => void
}) {
  const menuItems: Array<{ id: WindowId; icon: string; label: string; color: string }> = [
    { id: 'about', icon: '🤖', label: 'About Me', color: COLORS.primary },
    { id: 'experience', icon: '💼', label: 'Experience', color: COLORS.accent },
    { id: 'projects', icon: '🚀', label: 'Projects', color: COLORS.secondary },
    { id: 'skills', icon: '⚡', label: 'Skills', color: COLORS.green },
    { id: 'certifications', icon: '🎓', label: 'Certifications', color: '#00B4D8' },
    { id: 'research', icon: '🔬', label: 'Research', color: COLORS.yellow },
    { id: 'achievements', icon: '🏆', label: 'Achievements', color: COLORS.yellow },
    { id: 'resume', icon: '📄', label: 'Resume', color: COLORS.muted },
    { id: 'contact', icon: '📡', label: 'Contact', color: COLORS.orange },
    { id: 'terminal', icon: '💻', label: 'Terminal', color: COLORS.primary },
    { id: 'settings', icon: '⚙️', label: 'Settings', color: COLORS.muted },
  ]

  const handleClick = (id: WindowId) => {
    onOpenWindow(id)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[55]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="absolute bottom-14 left-2 z-[60] w-64 rounded-xl overflow-hidden"
            style={{
              background: 'rgba(10, 15, 40, 0.92)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${COLORS.primary}20`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${COLORS.primary}10`,
            }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 border-b"
              style={{ borderBottom: `1px solid ${COLORS.primary}15` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🖥️</span>
                <div>
                  <h3 className="font-orbitron text-xs font-bold" style={{ color: COLORS.primary }}>
                    SRIRAM.OS
                  </h3>
                  <p className="font-jetbrains text-[9px]" style={{ color: COLORS.muted }}>
                    v3.0.1 • AI Operating System
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
              {menuItems.map((item, idx) => (
                <motion.button
                  key={item.id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left"
                  style={{
                    color: COLORS.text,
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = `${item.color}15`
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                  onClick={() => handleClick(item.id)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="font-jetbrains text-xs" style={{ color: COLORS.text }}>
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div
              className="px-4 py-2 border-t"
              style={{ borderTop: `1px solid ${COLORS.primary}15` }}
            >
              <p className="font-jetbrains text-[9px]" style={{ color: COLORS.muted }}>
                Built with Next.js & Framer Motion
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Taskbar ─────────────────────────────────────────────────────────────────────

function Taskbar({
  openWindows,
  activeWindow,
  onFocusWindow,
  onStartClick,
  startMenuOpen,
  onCloseStartMenu,
  onOpenWindow,
}: {
  openWindows: WindowId[]
  activeWindow: WindowId | null
  onFocusWindow: (id: WindowId) => void
  onStartClick: () => void
  startMenuOpen: boolean
  onCloseStartMenu: () => void
  onOpenWindow: (id: WindowId) => void
}) {
  const [time, setTime] = useState('')
  const soundEnabled = useOSStore(s => s.soundEnabled)
  const toggleSound = useOSStore(s => s.toggleSound)

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <StartMenu isOpen={startMenuOpen} onClose={onCloseStartMenu} onOpenWindow={onOpenWindow} />

      <div
        className="absolute bottom-0 left-0 right-0 h-12 flex items-center px-2 gap-1 z-[70]"
        style={{
          background: 'rgba(5, 8, 22, 0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${COLORS.primary}15`,
          boxShadow: '0 -2px 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Start Button */}
        <motion.button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg h-8"
          style={{
            background: startMenuOpen ? `${COLORS.primary}20` : 'transparent',
            border: `1px solid ${startMenuOpen ? COLORS.primary + '40' : 'transparent'}`,
            transition: 'background 150ms, border-color 150ms',
          }}
          onClick={onStartClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="text-sm">🖥️</span>
          <span
            className="font-orbitron text-[10px] font-bold hidden sm:inline"
            style={{ color: startMenuOpen ? COLORS.primary : COLORS.muted }}
          >
            SRIRAM.OS
          </span>
        </motion.button>

        {/* Separator */}
        <div className="w-px h-6 mx-1" style={{ background: `${COLORS.primary}20` }} />

        {/* Open Windows */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {openWindows.map((winId) => {
            const config = getWindowConfig(winId)
            const isActive = activeWindow === winId
            return (
              <motion.button
                key={winId}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg h-8 shrink-0"
                style={{
                  background: isActive ? `${config.color}15` : 'rgba(148,163,184,0.05)',
                  border: `1px solid ${isActive ? config.color + '30' : 'rgba(148,163,184,0.08)'}`,
                  boxShadow: isActive ? `0 0 8px ${config.color}15` : 'none',
                  transition: 'background 150ms, border-color 150ms, box-shadow 150ms',
                }}
                onClick={() => onFocusWindow(winId)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                layout
              >
                <span className="text-xs">{config.icon}</span>
                <span
                  className="font-jetbrains text-[10px] hidden sm:inline max-w-[80px] truncate"
                  style={{ color: isActive ? config.color : COLORS.muted }}
                >
                  {config.title}
                </span>
                {isActive && (
                  <motion.div
                    className="w-1 h-1 rounded-full ml-0.5"
                    style={{ background: config.color, boxShadow: `0 0 4px ${config.color}` }}
                    layoutId="activeWindowIndicator"
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
            style={{
              background: soundEnabled ? 'transparent' : 'rgba(255,68,68,0.1)',
            }}
            onClick={toggleSound}
          >
            <span className="text-sm">{soundEnabled ? '🔊' : '🔇'}</span>
          </button>

          {/* Assistant Button */}
          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
            style={{ background: 'transparent' }}
          >
            <span className="text-sm">🤖</span>
          </button>

          {/* Separator */}
          <div className="w-px h-5" style={{ background: `${COLORS.primary}15` }} />

          {/* Time */}
          <div className="font-jetbrains text-[10px] px-2" style={{ color: COLORS.muted }}>
            {time}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Main Desktop Component ──────────────────────────────────────────────────────

export default function Desktop() {
  const {
    openWindows,
    activeWindow,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
  } = useOSStore()

  const [startMenuOpen, setStartMenuOpen] = useState(false)
  const { play } = useSound()
  const unlockSecret = useOSStore(s => s.unlockSecret)

  // Konami code handler
  useKonamiCode(unlockSecret)

  // Map building clicks from PixelWorld to window opens
  const handleBuildingClick = useCallback((buildingId: string) => {
    const windowId = BUILDING_TO_WINDOW[buildingId]
    if (windowId) {
      play('open')
      openWindow(windowId)
    }
  }, [openWindow, play])

  const handleOpenWindow = useCallback((id: WindowId) => {
    play('open')
    openWindow(id)
  }, [openWindow, play])

  const handleCloseWindow = useCallback((id: WindowId) => {
    play('close')
    closeWindow(id)
  }, [closeWindow, play])

  const handleMinimizeWindow = useCallback((id: WindowId) => {
    play('click')
    minimizeWindow(id)
  }, [minimizeWindow, play])

  const handleFocusWindow = useCallback((id: WindowId) => {
    play('click')
    focusWindow(id)
  }, [focusWindow, play])

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: COLORS.bg }}>
      {/* PixelWorld Background */}
      <div className="absolute inset-0">
        <PixelWorld onBuildingClick={handleBuildingClick} />
      </div>

      {/* Windows Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {openWindows.map((winId, index) => {
          const config = getWindowConfig(winId)
          return (
            <div key={winId} className="pointer-events-auto">
              <Window
                id={winId}
                title={config.title}
                icon={config.icon}
                isActive={activeWindow === winId}
                onClose={() => handleCloseWindow(winId)}
                onFocus={() => handleFocusWindow(winId)}
                onMinimize={() => handleMinimizeWindow(winId)}
                width={config.width}
                height={config.height}
                color={config.color}
                zIndex={10 + index}
              >
                <WindowContent windowId={winId} />
              </Window>
            </div>
          )
        })}
      </div>

      {/* Taskbar */}
      <Taskbar
        openWindows={openWindows}
        activeWindow={activeWindow}
        onFocusWindow={handleFocusWindow}
        onStartClick={() => setStartMenuOpen(prev => !prev)}
        startMenuOpen={startMenuOpen}
        onCloseStartMenu={() => setStartMenuOpen(false)}
        onOpenWindow={handleOpenWindow}
      />

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  )
}
