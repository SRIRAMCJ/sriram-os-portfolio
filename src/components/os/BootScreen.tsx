'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BootScreenProps {
  onComplete: () => void
}

const BOOT_MESSAGES = [
  'Initializing AI Core...',
  'Loading Neural Network...',
  'Connecting Knowledge Base...',
  'Loading Models...',
  'Loading Projects...',
  'Loading Experience...',
  'Loading Research...',
  'Loading Portfolio...',
  'System Ready ✓',
] as const

const MESSAGE_DELAYS = [500, 400, 550, 350, 450, 500, 400, 350, 600] as const

function typeWriter(text: string, speed: number): Promise<string> {
  return new Promise((resolve) => {
    let i = 0
    const result: string[] = []
    const interval = setInterval(() => {
      result.push(text[i])
      i++
      if (i >= text.length) {
        clearInterval(interval)
        resolve(result.join(''))
      }
    }, speed)
  })
}

function HexGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="hexGrid" width="50" height="43.4" patternUnits="userSpaceOnUse">
            <path
              d="M25 0 L50 14.4 L50 28.8 L25 43.4 L0 28.8 L0 14.4 Z"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexGrid)" />
      </svg>
    </div>
  )
}

function ParticleField() {
  const particles = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
    }))
  )

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.current.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#00E5FF]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            boxShadow: '0 0 6px #00E5FF, 0 0 12px rgba(0,229,255,0.3)',
          }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -40, -80],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function SystemInfo() {
  return (
    <motion.div
      className="font-jetbrains text-[10px] sm:text-xs text-[#94A3B8]/60 mb-6 sm:mb-8 space-y-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-[#00E5FF]/60">▍</span>
        <span>SRIRAM.OS v3.0.1 — AI Operating System</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[#00E5FF]/60">▍</span>
        <span>Kernel: Neural-Engine 4.2.1</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[#00E5FF]/60">▍</span>
        <span>Architecture: x86_64 + Neural Coprocessor</span>
      </div>
    </motion.div>
  )
}

function AsciiLogo() {
  return (
    <motion.pre
      className="font-jetbrains text-[6px] sm:text-[8px] md:text-[10px] leading-tight text-[#00E5FF] mb-4 sm:mb-6 select-none"
      style={{
        textShadow: '0 0 10px rgba(0,229,255,0.5), 0 0 20px rgba(0,229,255,0.2)',
        filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.15))',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
{`
 ███████╗██╗███████╗ ██████╗ ██╗   ██╗███╗   ██╗████████╗
 ██╔════╝██║██╔════╝██╔═══██╗██║   ██║████╗  ██║╚══██╔══╝
 █████╗  ██║███████╗██║   ██║██║   ██║██╔██╗ ██║   ██║   
 ██╔══╝  ██║╚════██║██║   ██║██║   ██║██║╚██╗██║   ██║   
 ██║     ██║███████║╚██████╔╝╚██████╔╝██║ ╚████║   ██║   
 ╚═╝     ╚═╝╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   
                    . O S   v 3 . 0
`}
    </motion.pre>
  )
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between font-jetbrains text-[10px] sm:text-xs mb-2">
        <span className="text-[#94A3B8]/60">SYSTEM BOOT</span>
        <span className="text-[#00E5FF]" style={{ textShadow: '0 0 8px rgba(0,229,255,0.4)' }}>
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full h-1.5 sm:h-2 bg-[#0a0f28] rounded-full overflow-hidden border border-[#00E5FF]/10">
        <motion.div
          className="h-full rounded-full relative"
          style={{
            background: 'linear-gradient(90deg, #00E5FF, #6C63FF, #00E5FF)',
            backgroundSize: '200% 100%',
            animation: 'gradient-shift 3s linear infinite',
            boxShadow: '0 0 12px rgba(0,229,255,0.5), 0 0 24px rgba(0,229,255,0.2)',
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              animation: 'shimmer 2s linear infinite',
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}

function BootMessage({
  message,
  isActive,
  isComplete,
  index,
}: {
  message: string
  isActive: boolean
  isComplete: boolean
  index: number
}) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!isActive) return

    setIsTyping(true)
    let i = 0
    const speed = 25 + Math.random() * 15

    const interval = setInterval(() => {
      i++
      setDisplayedText(message.slice(0, i))
      if (i >= message.length) {
        clearInterval(interval)
        setIsTyping(false)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [isActive, message])

  if (!isActive && !isComplete) return null

  return (
    <motion.div
      className="flex items-center gap-2 font-jetbrains text-xs sm:text-sm"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="text-[#00E5FF]/70 shrink-0">{'>'}</span>
      <span
        className={`${isComplete && !isTyping ? 'text-[#00FF88]' : 'text-[#00E5FF]'}`}
        style={{
          textShadow: isComplete && !isTyping
            ? '0 0 8px rgba(0,255,136,0.4)'
            : '0 0 8px rgba(0,229,255,0.3)',
        }}
      >
        {displayedText}
      </span>
      {isTyping && (
        <motion.span
          className="inline-block w-2 h-4 bg-[#00E5FF]"
          style={{ boxShadow: '0 0 6px #00E5FF' }}
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
      {isComplete && !isTyping && (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {message.includes('✓') ? null : (
            <span className="text-[#00FF88] text-[10px] ml-1">OK</span>
          )}
        </motion.span>
      )}
    </motion.div>
  )
}

function PressEnterPrompt({ visible }: { visible: boolean }) {
  const handleKeyDown = useCallback(() => {}, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="font-jetbrains text-sm sm:text-base mt-8 flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="text-[#00E5FF]"
            style={{ textShadow: '0 0 10px rgba(0,229,255,0.5), 0 0 20px rgba(0,229,255,0.2)' }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            ▶ Press ENTER to continue
          </motion.span>
          <motion.span
            className="inline-block w-3 h-5 bg-[#00E5FF]"
            style={{ boxShadow: '0 0 8px #00E5FF, 0 0 16px rgba(0,229,255,0.3)' }}
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set())
  const [allComplete, setAllComplete] = useState(false)
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef<number>(0)
  const hasCalledComplete = useRef(false)

  // Start the boot sequence
  useEffect(() => {
    startTimeRef.current = Date.now()
    const startDelay = setTimeout(() => {
      setActiveIndex(0)
    }, 1200)
    return () => clearTimeout(startDelay)
  }, [])

  // Advance through messages
  useEffect(() => {
    if (activeIndex < 0 || activeIndex >= BOOT_MESSAGES.length) return

    const message = BOOT_MESSAGES[activeIndex]
    const delay = MESSAGE_DELAYS[activeIndex]
    // Estimate typing time: ~30ms per char + base delay
    const typingTime = message.length * 35 + delay

    const timer = setTimeout(() => {
      setCompletedIndices((prev) => new Set([...prev, activeIndex]))
      setProgress(((activeIndex + 1) / BOOT_MESSAGES.length) * 100)

      if (activeIndex < BOOT_MESSAGES.length - 1) {
        const nextDelay = 150 + Math.random() * 200
        setTimeout(() => {
          setActiveIndex((prev) => prev + 1)
        }, nextDelay)
      } else {
        setAllComplete(true)
      }
    }, typingTime)

    return () => clearTimeout(timer)
  }, [activeIndex])

  // Listen for ENTER key
  useEffect(() => {
    if (!allComplete) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !hasCalledComplete.current) {
        hasCalledComplete.current = true
        onComplete()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [allComplete, onComplete])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 sm:p-8"
      style={{ background: '#050816' }}
    >
      {/* CRT Scanline overlay */}
      <div className="crt-scanlines absolute inset-0 pointer-events-none" />

      {/* CRT flicker */}
      <motion.div
        className="absolute inset-0 pointer-events-none bg-[#00E5FF]/[0.008]"
        animate={{ opacity: [0, 0.5, 0, 0.3, 0, 0.1, 0] }}
        transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 + Math.random() * 5 }}
      />

      {/* Hex grid background */}
      <HexGrid />

      {/* Floating particles */}
      <ParticleField />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(5,8,22,0.6) 100%)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* ASCII Logo */}
        <AsciiLogo />

        {/* System info */}
        <SystemInfo />

        {/* Progress bar */}
        <ProgressBar progress={progress} />

        {/* Boot messages */}
        <div className="space-y-1.5 sm:space-y-2 min-h-[220px] sm:min-h-[260px]">
          {BOOT_MESSAGES.map((message, index) => (
            <BootMessage
              key={index}
              message={message}
              isActive={activeIndex === index}
              isComplete={completedIndices.has(index)}
              index={index}
            />
          ))}
        </div>

        {/* Press ENTER prompt */}
        <PressEnterPrompt visible={allComplete} />

        {/* Bottom decorative line */}
        <motion.div
          className="mt-6 sm:mt-8 h-px w-full"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(0,229,255,0.3), rgba(108,99,255,0.3), transparent)',
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
        />

        {/* Bottom status */}
        <motion.div
          className="font-jetbrains text-[9px] sm:text-[10px] text-[#94A3B8]/30 mt-3 flex justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span>MEM: 32768MB / GPU: NVIDIA RTX 5090</span>
          <span>{allComplete ? 'BOOT COMPLETE' : 'BOOTING...'}</span>
        </motion.div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-6 h-6 border-l border-t border-[#00E5FF]/20" />
      <div className="absolute top-4 right-4 w-6 h-6 border-r border-t border-[#00E5FF]/20" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-l border-b border-[#00E5FF]/20" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-r border-b border-[#00E5FF]/20" />

      {/* Scan line that moves down */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(0,229,255,0.08), rgba(0,229,255,0.15), rgba(0,229,255,0.08), transparent)',
        }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}
