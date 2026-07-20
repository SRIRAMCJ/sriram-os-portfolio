'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOSStore } from '@/store/useOSStore'
import { useSound } from '@/hooks/useSound'

// ─── Types ───────────────────────────────────────────────────────────────────

interface LoginScreenProps {
  onLogin: (name: string) => void
}

// ─── Particle Component ──────────────────────────────────────────────────────

function FloatingParticles() {
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.5 + 0.1,
    }))
  ).current

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0
              ? '#00E5FF'
              : p.id % 3 === 1
                ? '#6C63FF'
                : '#FF00C8',
          }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity * 0.5, p.opacity * 1.2, p.opacity],
            scale: [1, 1.2, 0.8, 1.1, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── Animated Grid Background ────────────────────────────────────────────────

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base grid */}
      <div className="absolute inset-0 cyber-grid" />
      {/* Animated scan line moving across grid */}
      <motion.div
        className="absolute left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.15), transparent)',
          boxShadow: '0 0 20px rgba(0,229,255,0.1), 0 0 60px rgba(0,229,255,0.05)',
        }}
        animate={{ top: ['0%', '100%'] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {/* Radial glow from center */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.03) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

// ─── Typing Hook ─────────────────────────────────────────────────────────────

function useTypingEffect(text: string, speed = 50, startDelay = 0, enabled = true) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!enabled) return
    setDisplayed('')
    setDone(false)

    let timeout: ReturnType<typeof setTimeout>

    const startTyping = () => {
      let i = 0
      const type = () => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1))
          i++
          timeout = setTimeout(type, speed + Math.random() * 30)
        } else {
          setDone(true)
        }
      }
      type()
    }

    if (startDelay > 0) {
      timeout = setTimeout(startTyping, startDelay)
    } else {
      startTyping()
    }

    return () => clearTimeout(timeout)
  }, [text, speed, startDelay, enabled])

  return { displayed, done }
}

// ─── Hexagon Decoration ──────────────────────────────────────────────────────

function HexDecoration() {
  return (
    <svg
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.03] pointer-events-none"
      viewBox="0 0 200 200"
      aria-hidden="true"
    >
      <polygon
        points="100,10 180,55 180,145 100,190 20,145 20,55"
        fill="none"
        stroke="#00E5FF"
        strokeWidth="0.5"
      />
      <polygon
        points="100,30 160,65 160,135 100,170 40,135 40,65"
        fill="none"
        stroke="#6C63FF"
        strokeWidth="0.3"
      />
      <polygon
        points="100,50 140,75 140,125 100,150 60,125 60,75"
        fill="none"
        stroke="#FF00C8"
        strokeWidth="0.2"
      />
    </svg>
  )
}

// ─── Main Login Screen ───────────────────────────────────────────────────────

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [name, setName] = useState('')
  const [phase, setPhase] = useState<'input' | 'welcome' | 'complete'>('input')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { play } = useSound()
  const soundEnabled = useOSStore((s) => s.soundEnabled)

  // Typing effects
  const welcomeTyping = useTypingEffect('Welcome, Visitor', 80, 800, phase === 'input')

  const aiMessage = `Welcome, ${name || 'Visitor'}! Initializing your session...`
  const aiTyping = useTypingEffect(aiMessage, 45, 300, phase === 'welcome')

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  // When AI welcome message completes typing, trigger onLogin
  useEffect(() => {
    if (phase === 'welcome' && aiTyping.done) {
      const timer = setTimeout(() => {
        setPhase('complete')
        onLogin(name || 'Visitor')
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [phase, aiTyping.done, name, onLogin])

  const handleSubmit = useCallback(() => {
    if (isSubmitting) return
    const trimmed = name.trim()
    const finalName = trimmed || 'Visitor'
    setIsSubmitting(true)
    play('boot')
    setName(finalName)
    setPhase('welcome')
  }, [name, isSubmitting, play])

  const handleSkip = useCallback(() => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setName('Visitor')
    play('click')
    setPhase('welcome')
  }, [isSubmitting, play])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: '#050816' }}>
      {/* Scanline overlay */}
      <div className="crt-scanlines absolute inset-0 z-50 pointer-events-none" aria-hidden="true" />

      {/* Animated grid background */}
      <AnimatedGrid />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Hex decoration */}
      <HexDecoration />

      {/* CRT flicker overlay */}
      <div className="crt absolute inset-0 z-40 pointer-events-none" aria-hidden="true" />

      {/* Main content */}
      <div className="relative z-30 flex flex-col items-center justify-center h-full px-4">
        {/* Logo / Title Section */}
        <motion.div
          className="flex flex-col items-center mb-10"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Decorative top bar */}
          <motion.div
            className="w-24 h-[2px] mb-8"
            style={{
              background: 'linear-gradient(90deg, transparent, #00E5FF, transparent)',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          />

          {/* Main Title */}
          <motion.h1
            className="font-orbitron text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-wider glow-cyan"
            style={{ color: '#00E5FF' }}
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
          >
            SRIRAM.OS
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="font-jetbrains text-sm sm:text-base tracking-[0.3em] mt-3"
            style={{ color: '#94A3B8' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            AI Operating System v2.0
          </motion.p>

          {/* Decorative bottom bar */}
          <motion.div
            className="w-16 h-[1px] mt-4"
            style={{
              background: 'linear-gradient(90deg, transparent, #6C63FF, transparent)',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1 }}
          />
        </motion.div>

        {/* Welcome typing message */}
        <motion.div
          className="mb-8 h-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="font-jetbrains text-lg" style={{ color: '#00E5FF' }}>
            {phase === 'input' ? (
              <>
                <span>{welcomeTyping.displayed}</span>
                {!welcomeTyping.done && (
                  <span className="typing-cursor" />
                )}
              </>
            ) : (
              <span>{welcomeTyping.displayed}</span>
            )}
          </p>
        </motion.div>

        {/* Input / Welcome area */}
        <AnimatePresence mode="wait">
          {phase === 'input' && (
            <motion.div
              key="input-phase"
              className="flex flex-col items-center w-full max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {/* Input field */}
              <motion.div
                className="relative w-full group"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                {/* Animated border */}
                <div
                  className="absolute -inset-[1px] rounded-lg opacity-50 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(45deg, #00E5FF, #6C63FF, #FF00C8, #00E5FF)',
                    backgroundSize: '300% 300%',
                    animation: 'gradient-shift 8s ease infinite',
                  }}
                />

                {/* Inner container */}
                <div
                  className="relative rounded-lg"
                  style={{ background: 'rgba(5, 8, 22, 0.95)' }}
                >
                  {/* Terminal prompt */}
                  <div className="flex items-center px-4 pt-3 pb-1">
                    <span className="font-jetbrains text-xs" style={{ color: '#6C63FF' }}>
                      visitor@sriram-os:~$
                    </span>
                  </div>

                  <div className="flex items-center px-4 pb-3 gap-2">
                    <span className="font-jetbrains text-sm" style={{ color: '#00E5FF' }}>
                      {'>'}
                    </span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        if (soundEnabled && e.target.value.length > name.length) {
                          play('type')
                        }
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter your name..."
                      className="flex-1 bg-transparent outline-none font-jetbrains text-base placeholder:text-[#94A3B8]/40"
                      style={{
                        color: '#FFFFFF',
                        caretColor: '#00E5FF',
                      }}
                      maxLength={30}
                      autoComplete="off"
                      spellCheck={false}
                      aria-label="Enter your name to login"
                    />
                    <motion.span
                      className="inline-block w-[2px] h-5"
                      style={{ background: '#00E5FF' }}
                      animate={{ opacity: [1, 0] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                      }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Enter System Button */}
              <motion.button
                onClick={handleSubmit}
                className="mt-6 w-full max-w-xs relative overflow-hidden rounded-lg px-8 py-3 font-orbitron text-sm font-semibold tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, #00E5FF, #6C63FF)',
                  color: '#050816',
                }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: '0 0 20px rgba(0,229,255,0.4), 0 0 40px rgba(0,229,255,0.2), 0 0 60px rgba(108,99,255,0.15)',
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
                aria-label="Enter the system"
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  }}
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    repeatDelay: 3,
                  }}
                />
                <span className="relative z-10">ENTER SYSTEM</span>
              </motion.button>

              {/* Skip link */}
              <motion.button
                onClick={handleSkip}
                className="mt-4 font-jetbrains text-xs tracking-wider opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer bg-transparent border-none"
                style={{ color: '#94A3B8' }}
                whileHover={{ color: '#00E5FF' }}
                aria-label="Skip login and enter as Visitor"
              >
                [ SKIP → ]
              </motion.button>
            </motion.div>
          )}

          {phase === 'welcome' && (
            <motion.div
              key="welcome-phase"
              className="flex flex-col items-center w-full max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
              transition={{ duration: 0.5 }}
            >
              {/* AI Welcome Message Container */}
              <motion.div
                className="glass rounded-lg p-6 w-full"
                initial={{ borderColor: 'rgba(0,229,255,0.1)' }}
                animate={{
                  borderColor: [
                    'rgba(0,229,255,0.1)',
                    'rgba(0,229,255,0.4)',
                    'rgba(108,99,255,0.4)',
                    'rgba(0,229,255,0.1)',
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ border: '1px solid' }}
              >
                {/* AI Header */}
                <div className="flex items-center gap-2 mb-3">
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#00E5FF' }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="font-jetbrains text-xs" style={{ color: '#6C63FF' }}>
                    AI-CORE
                  </span>
                  <span className="font-jetbrains text-xs" style={{ color: '#94A3B8' }}>
                    │ session.init()
                  </span>
                </div>

                {/* AI Message */}
                <div className="font-jetbrains text-base" style={{ color: '#00E5FF' }}>
                  <span>{aiTyping.displayed}</span>
                  {!aiTyping.done && <span className="typing-cursor" />}
                </div>

                {/* Progress bar */}
                <motion.div
                  className="mt-4 h-[2px] rounded-full overflow-hidden"
                  style={{ background: 'rgba(0,229,255,0.1)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #00E5FF, #6C63FF)',
                      boxShadow: '0 0 8px rgba(0,229,255,0.5)',
                    }}
                    initial={{ width: '0%' }}
                    animate={{ width: aiTyping.done ? '100%' : `${(aiTyping.displayed.length / aiMessage.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>

                {/* Status line */}
                <div className="mt-3 flex justify-between items-center">
                  <span className="font-jetbrains text-[10px]" style={{ color: '#94A3B8' }}>
                    {aiTyping.done ? 'STATUS: READY' : 'STATUS: INITIALIZING...'}
                  </span>
                  <motion.div
                    className="flex gap-1"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full"
                        style={{ background: '#00E5FF' }}
                      />
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom system info */}
        <motion.div
          className="absolute bottom-6 left-0 right-0 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
        >
          <div className="flex items-center gap-4 font-jetbrains text-[10px] tracking-wider" style={{ color: '#94A3B8' }}>
            <span style={{ color: '#00E5FF' }}>●</span>
            <span>SYSTEM ONLINE</span>
            <span style={{ color: 'rgba(0,229,255,0.3)' }}>│</span>
            <span>NEURAL CORE: ACTIVE</span>
            <span style={{ color: 'rgba(0,229,255,0.3)' }}>│</span>
            <span>MEM: 128TB</span>
            <span style={{ color: 'rgba(0,229,255,0.3)' }}>│</span>
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ◈
            </motion.span>
          </div>
        </motion.div>

        {/* Corner decorations */}
        {/* Top-left corner */}
        <motion.div
          className="absolute top-4 left-4 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1.5 }}
          aria-hidden="true"
        >
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <path d="M0 0 L30 0 L30 4 L4 4 L4 30 L0 30 Z" fill="#00E5FF" />
          </svg>
        </motion.div>

        {/* Top-right corner */}
        <motion.div
          className="absolute top-4 right-4 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1.5 }}
          aria-hidden="true"
        >
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <path d="M0 0 L30 0 L30 30 L26 30 L26 4 L0 4 Z" fill="#6C63FF" />
          </svg>
        </motion.div>

        {/* Bottom-left corner */}
        <motion.div
          className="absolute bottom-4 left-4 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1.5 }}
          aria-hidden="true"
        >
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <path d="M0 0 L4 0 L4 26 L30 26 L30 30 L0 30 Z" fill="#FF00C8" />
          </svg>
        </motion.div>

        {/* Bottom-right corner */}
        <motion.div
          className="absolute bottom-4 right-4 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1.5 }}
          aria-hidden="true"
        >
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <path d="M26 0 L30 0 L30 30 L0 30 L0 26 L26 26 Z" fill="#00E5FF" />
          </svg>
        </motion.div>

        {/* Vignette overlay */}
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(5,8,22,0.8) 100%)',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
