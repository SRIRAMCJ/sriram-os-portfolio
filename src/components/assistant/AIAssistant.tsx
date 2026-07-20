'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Sparkles } from 'lucide-react'
import { useOSStore, type ChatMessage } from '@/store/useOSStore'
import { useSound } from '@/hooks/useSound'
import {
  aboutData,
  projectsData,
  skillsData,
  experienceData,
  certificationsData,
  researchData,
} from '@/lib/portfolio-data'

// ─── Colors ───────────────────────────────────────────────────────────
const COLORS = {
  primary: '#00E5FF',
  secondary: '#6C63FF',
  accent: '#FF00C8',
  text: '#FFFFFF',
  muted: '#94A3B8',
} as const

// ─── Typing Indicator ────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-start gap-2 px-3 py-2"
    >
      <div
        className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-3"
        style={{
          background: 'rgba(10, 15, 40, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(108, 99, 255, 0.25)',
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: COLORS.primary }}
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ─── Single Chat Message ─────────────────────────────────────────────
function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center px-3 py-1"
      >
        <span
          className="text-xs italic"
          style={{ color: COLORS.muted }}
        >
          {message.content}
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20, y: 4 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-3 py-1.5`}
    >
      <div
        className="relative max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
        style={
          isUser
            ? {
                background: `linear-gradient(135deg, ${COLORS.primary}22, ${COLORS.primary}44)`,
                border: `1px solid ${COLORS.primary}55`,
                borderRadius: '16px 16px 4px 16px',
                color: COLORS.text,
              }
            : {
                background: 'rgba(10, 15, 40, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(108, 99, 255, 0.25)',
                borderRadius: '16px 16px 16px 4px',
                color: COLORS.text,
              }
        }
      >
        {!isUser && (
          <div
            className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: COLORS.secondary }}
          >
            <Sparkles className="h-3 w-3" />
            SRIRAM.AI
          </div>
        )}
        {message.content}
      </div>
    </motion.div>
  )
}

// ─── Local Knowledge Base ────────────────────────────────────────────
function generateResponse(input: string): string {
  const lower = input.toLowerCase().trim()

  // Greetings
  if (/^(hello|hi|hey|greetings|howdy|yo|sup)\b/.test(lower)) {
    return `Hey there! 👋 Welcome to SRIRAM.OS!\n\nI'm your AI assistant, ready to help you explore Sriram's portfolio. You can ask me about:\n\n• Projects & work samples\n• Technical skills\n• Work experience\n• Research publications\n• Certifications\n• Contact information\n\nWhat would you like to know?`
  }

  // Help
  if (/\b(help|what can you|what do you|commands|options)\b/.test(lower)) {
    return `I can help you explore Sriram's portfolio! Try asking about:\n\n🚀 **Projects** — Featured AI/ML projects\n⚡ **Skills** — Technical skill breakdown\n💼 **Experience** — Work history & internships\n📄 **Research** — Published papers\n🎓 **Certifications** — Professional credentials\n📧 **Contact** — How to reach Sriram\n👤 **About** — Who is Sriram?\n\nJust type naturally — I'll understand! 😊`
  }

  // About
  if (/\b(about|who|sriram|yourself|himself|introduction|intro)\b/.test(lower)) {
    return `👨‍💻 **Sriram V**\n\n${aboutData.title}\n"${aboutData.tagline}"\n\n🎓 ${aboutData.education.degree}\n📍 ${aboutData.education.college}, ${aboutData.education.location} (${aboutData.education.year})\n\n🏆 **Key Achievements:**\n${aboutData.achievements.map((a) => `  • ${a}`).join('\n')}\n\n💡 "${aboutData.careerObjective.slice(0, 120)}..."`
  }

  // Projects
  if (/\b(project|portfolio|work sample|built|created|developed|demo)\b/.test(lower)) {
    const projectList = projectsData
      .map(
        (p, i) =>
          `${i + 1}. **${p.title}** ${p.icon}\n   ${p.description}\n   Tech: ${p.techStack.join(', ')}\n   ${Object.entries(p.metrics)
             .map(([k, v]) => `${k}: ${v}`)
             .join(' | ')}`
      )
      .join('\n\n')
    return `🚀 **Featured Projects:**\n\n${projectList}\n\nWant to know more about any specific project? Just ask!`
  }

  // Skills
  if (/\b(skill|tech|technology|stack|programming|language|framework|tool|know)\b/.test(lower)) {
    const formatCategory = (title: string, items: { name: string; level: number }[]) => {
      const top = items.slice(0, 5)
      return `\n⚡ **${title}:**\n${top.map((s) => `  • ${s.name} (${s.level}%)`).join('\n')}`
    }
    return (
      `🧠 **Technical Skills Overview:**\n` +
      formatCategory('Languages', skillsData.languages) +
      formatCategory('AI/ML', skillsData.ai_ml) +
      formatCategory('Frontend', skillsData.frontend) +
      formatCategory('Backend', skillsData.backend) +
      formatCategory('DevOps', skillsData.devops) +
      `\n\nWant details on any specific category?`
    )
  }

  // Experience
  if (/\b(experience|work|intern|job|company|employment|career)\b/.test(lower)) {
    const expList = experienceData
      .map(
        (e, i) =>
          `${i + 1}. **${e.role}** @ ${e.company}\n   ${e.duration} • ${e.location} (${e.type})\n   Impact: ${e.impact}\n   Tech: ${e.tech.join(', ')}`
      )
      .join('\n\n')
    return `💼 **Work Experience:**\n\n${expList}\n\nWant more details on any role?`
  }

  // Research
  if (/\b(research|paper|publication|scopus|journal|academic|cite|study)\b/.test(lower)) {
    const paperList = researchData
      .map(
        (r, i) =>
          `${i + 1}. "${r.title}"\n   Type: ${r.type} Indexed | Year: ${r.year} | Citations: ${r.citations}\n   ${r.abstract.slice(0, 150)}...`
      )
      .join('\n\n')
    return `📄 **Research Publications:**\n\n${paperList}\n\nSriram is a SCOPUS-published researcher with impactful work in AI & Computer Vision!`
  }

  // Certifications
  if (/\b(certif|certificate|credential|oracle|google|course)\b/.test(lower)) {
    const certList = certificationsData
      .map(
        (c, i) =>
          `${i + 1}. ${c.icon} **${c.title}**\n   Issued by: ${c.issuer} (${c.date})\n   Credential: ${c.credentialId}`
      )
      .join('\n\n')
    return `🎓 **Certifications:**\n\n${certList}\n\nSriram holds certifications from Oracle, Google, and more!`
  }

  // Contact
  if (/\b(contact|email|reach|hire|connect|linkedin|github|phone|message)\b/.test(lower)) {
    return `📧 **Get in Touch with Sriram:**\n\n📧 Email: ${aboutData.email}\n📱 Phone: ${aboutData.phone}\n📍 Location: ${aboutData.location}\n🔗 LinkedIn: ${aboutData.linkedin}\n🐙 GitHub: ${aboutData.github}\n🌐 Portfolio: ${aboutData.portfolio}\n\nFeel free to reach out for collaborations, opportunities, or just to say hi! 🤝`
  }

  // Achievements
  if (/\b(achieve|award|winner|hackathon|accomplish)\b/.test(lower)) {
    return `🏆 **Achievements & Highlights:**\n\n${aboutData.achievements.map((a) => `  🌟 ${a}`).join('\n')}\n\nSriram is a recognized leader in the AI community!`
  }

  // Education
  if (/\b(educat|college|university|degree|btech|student|study|school)\b/.test(lower)) {
    return `🎓 **Education:**\n\n• **Degree:** ${aboutData.education.degree}\n• **College:** ${aboutData.education.college}\n• **Location:** ${aboutData.education.location}\n• **Year:** ${aboutData.education.year}\n\nSriram is passionate about AI and continuously learning cutting-edge technologies!`
  }

  // Leadership
  if (/\b(leader|team|mentor|manage|organize)\b/.test(lower)) {
    return `👥 **Leadership & Soft Skills:**\n\n**Leadership:**\n${aboutData.leadership.map((l) => `  • ${l}`).join('\n')}\n\n**Soft Skills:**\n${aboutData.softSkills.map((s) => `  • ${s}`).join('\n')}`
  }

  // Thank you
  if (/\b(thank|thanks|thx|appreciate)\b/.test(lower)) {
    return `You're welcome! 😊 I'm always here to help you explore Sriram's portfolio. Feel free to ask anything else!`
  }

  // Bye
  if (/\b(bye|goodbye|see you|later|quit|exit)\b/.test(lower)) {
    return `Goodbye! 👋 Thanks for exploring SRIRAM.OS. Come back anytime to learn more about Sriram's work! 🚀`
  }

  // Fallback — smart generic response
  return `Interesting question! 🤔 While I may not have a specific answer for that, I'm great at answering questions about Sriram's portfolio.\n\nTry asking about:\n• **Projects** — What has Sriram built?\n• **Skills** — What technologies does he know?\n• **Experience** — Where has he worked?\n• **Research** — What has he published?\n• **Certifications** — What credentials does he hold?\n• **Contact** — How to reach him?\n\nI'm here to help! 💡`
}

// ─── Main Component ──────────────────────────────────────────────────
export default function AIAssistant() {
  const { assistantOpen, toggleAssistant, assistantMessages, addAssistantMessage } =
    useOSStore()
  const { play } = useSound()

  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const initializedRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [assistantMessages, isTyping, scrollToBottom])

  // Add welcome message on first open
  useEffect(() => {
    if (assistantOpen && !initializedRef.current) {
      initializedRef.current = true
      const hasWelcome = assistantMessages.some(
        (m) => m.role === 'assistant' && m.content.includes('SRIRAM.AI')
      )
      if (!hasWelcome) {
        addAssistantMessage({
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content:
            'Hello! I\'m SRIRAM.AI, your guide to this portfolio. Ask me about projects, skills, experience, or anything else! 🤖',
          timestamp: Date.now(),
        })
      }
    }
  }, [assistantOpen, assistantMessages, addAssistantMessage])

  // Focus input when opened
  useEffect(() => {
    if (assistantOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [assistantOpen])

  // Handle sending a message
  const handleSend = useCallback(() => {
    const text = inputValue.trim()
    if (!text || isTyping) return

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    addAssistantMessage(userMsg)
    setInputValue('')
    setIsTyping(true)

    // Simulate AI thinking delay
    const delay = 600 + Math.random() * 800
    setTimeout(() => {
      const response = generateResponse(text)
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      }
      addAssistantMessage(aiMsg)
      setIsTyping(false)
      play('notify')
    }, delay)
  }, [inputValue, isTyping, addAssistantMessage, play])

  // Handle key press
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  // Toggle assistant open/close
  const handleToggle = useCallback(() => {
    toggleAssistant()
    play('click')
  }, [toggleAssistant, play])

  return (
    <>
      {/* ── Floating Button ─────────────────────────────────── */}
      <motion.button
        onClick={handleToggle}
        className="fixed bottom-20 right-4 z-[9999] flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
          boxShadow: `0 0 20px ${COLORS.primary}44, 0 0 40px ${COLORS.primary}22`,
          transition: 'box-shadow 200ms',
        }}
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            `0 0 20px ${COLORS.primary}44, 0 0 40px ${COLORS.primary}22`,
            `0 0 30px ${COLORS.primary}66, 0 0 60px ${COLORS.primary}33`,
            `0 0 20px ${COLORS.primary}44, 0 0 40px ${COLORS.primary}22`,
          ],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-label="Open AI Assistant"
      >
        <AnimatePresence mode="wait">
          {assistantOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Bot className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!assistantOpen && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${COLORS.primary}` }}
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </motion.button>

      {/* ── Chat Window ─────────────────────────────────────── */}
      <AnimatePresence>
        {assistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass fixed bottom-36 right-4 z-[9998] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl shadow-2xl"
            style={{
              height: 'min(520px, calc(100vh - 180px))',
              boxShadow: `0 0 40px ${COLORS.primary}15, 0 8px 32px rgba(0,0,0,0.4)`,
            }}
          >
            {/* ── Title Bar ────────────────────────────── */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                background: 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(108,99,255,0.12))',
                borderBottom: `1px solid ${COLORS.primary}22`,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  }}
                >
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3
                    className="text-sm font-bold tracking-wide"
                    style={{ color: COLORS.text }}
                  >
                    AI Assistant
                  </h3>
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: COLORS.primary }}
                  >
                    SRIRAM.AI Online
                  </span>
                </div>
              </div>
              <button
                onClick={handleToggle}
                className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-white/10"
                style={{ color: COLORS.muted }}
                aria-label="Close AI Assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── Messages Area ───────────────────────── */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto py-3"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: `${COLORS.primary}33 transparent`,
              }}
            >
              {/* System message at top */}
              <div className="mb-2 flex justify-center px-3">
                <span
                  className="rounded-full px-3 py-1 text-[10px]"
                  style={{
                    background: `${COLORS.primary}11`,
                    color: COLORS.muted,
                    border: `1px solid ${COLORS.primary}15`,
                  }}
                >
                  ✨ Powered by SRIRAM.AI
                </span>
              </div>

              {assistantMessages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}

              {isTyping && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ──────────────────────────── */}
            <div
              className="px-3 py-3"
              style={{
                borderTop: `1px solid ${COLORS.primary}15`,
                background: 'rgba(5, 8, 22, 0.4)',
              }}
            >
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-1.5"
                style={{
                  background: 'rgba(0, 229, 255, 0.05)',
                  border: `1px solid ${COLORS.primary}22`,
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  disabled={isTyping}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#94A3B8]/50"
                  style={{ color: COLORS.text }}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-30"
                  style={{
                    background: inputValue.trim()
                      ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`
                      : 'transparent',
                    color: COLORS.text,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Quick suggestions */}
              {assistantMessages.length <= 1 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['Projects', 'Skills', 'Experience', 'Research', 'Contact'].map(
                    (topic) => (
                      <motion.button
                        key={topic}
                        onClick={() => {
                          setInputValue(topic)
                          // Auto-send after a tick so state updates
                          setTimeout(() => {
                            const userMsg: ChatMessage = {
                              id: `user-${Date.now()}`,
                              role: 'user',
                              content: topic,
                              timestamp: Date.now(),
                            }
                            addAssistantMessage(userMsg)
                            setInputValue('')
                            setIsTyping(true)
                            setTimeout(() => {
                              const response = generateResponse(topic)
                              addAssistantMessage({
                                id: `ai-${Date.now()}`,
                                role: 'assistant',
                                content: response,
                                timestamp: Date.now(),
                              })
                              setIsTyping(false)
                              play('notify')
                            }, 600 + Math.random() * 800)
                          }, 50)
                        }}
                        className="rounded-full px-3 py-1 text-[11px] font-medium transition-colors"
                        style={{
                          background: `${COLORS.primary}11`,
                          color: COLORS.primary,
                          border: `1px solid ${COLORS.primary}22`,
                        }}
                        whileHover={{
                          backgroundColor: `${COLORS.primary}22`,
                          scale: 1.03,
                        }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {topic}
                      </motion.button>
                    )
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
