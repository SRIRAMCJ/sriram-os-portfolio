'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { terminalCommands } from '@/lib/portfolio-data'
import { useSound } from '@/hooks/useSound'

// ─── Types ───────────────────────────────────────────────────────────────────

interface TerminalProps {
  onOpenSection?: (sectionId: string) => void
}

interface TerminalLine {
  id: string
  type: 'input' | 'output' | 'error' | 'success' | 'warning' | 'system' | 'ascii' | 'matrix'
  content: string
  prompt?: string
  animated?: boolean
}

type ThemeColor = 'cyan' | 'purple' | 'pink'

const THEME_COLORS: Record<ThemeColor, { prompt: string; name: string }> = {
  cyan: { prompt: '#00E5FF', name: 'Cyber Cyan' },
  purple: { prompt: '#6C63FF', name: 'Neon Purple' },
  pink: { prompt: '#FF00C8', name: 'Synthwave Pink' },
}

const THEME_ORDER: ThemeColor[] = ['cyan', 'purple', 'pink']

const PROMPT = 'visitor@sriram.os:~$ '

const AVAILABLE_COMMANDS = [
  'help', 'about', 'skills', 'projects', 'research', 'experience',
  'contact', 'github', 'linkedin', 'whoami', 'ls', 'cat', 'clear',
  'theme', 'fortune', 'matrix', 'ascii', 'sudo', 'open',
]

const CAT_VALID_FILES = ['about', 'skills', 'projects', 'research', 'experience', 'contact']

const WELCOME_BANNER = `
█░█░█ █▀▀ █░░ █▀▀ █▀█ █▀▄▀█ █▀▀   ▀█▀ █▀█   █▀▀ █▀█
▀▄▀▄▀ ██▄ █░▄ █░░ █░█ █░▀░█ ██▄   ░█░ █▄█   █▀░ █▄█
            .OS Terminal v2.0

Welcome, visitor! Type 'help' for available commands.
`

// ─── Component ───────────────────────────────────────────────────────────────

export default function Terminal({ onOpenSection }: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [input, setInput] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [theme, setTheme] = useState<ThemeColor>('cyan')
  const [isMatrixActive, setIsMatrixActive] = useState(false)
  const [matrixChars, setMatrixChars] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingQueueRef = useRef<TerminalLine[]>([])
  const isTypingRef = useRef(false)

  const { play } = useSound()

  // ─── Welcome message on mount ────────────────────────────────────────────

  useEffect(() => {
    const welcomeLines: TerminalLine[] = [
      {
        id: crypto.randomUUID(),
        type: 'ascii',
        content: WELCOME_BANNER,
        animated: true,
      },
    ]
    setLines(welcomeLines)
  }, [])

  // ─── Auto-scroll to bottom ───────────────────────────────────────────────

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines, matrixChars])

  // ─── Focus input on click ────────────────────────────────────────────────

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  // ─── Typing animation processor ──────────────────────────────────────────

  const processTypingQueue = useCallback(() => {
    if (isTypingRef.current || typingQueueRef.current.length === 0) return

    isTypingRef.current = true
    setIsTyping(true)

    const line = typingQueueRef.current.shift()!
    const fullContent = line.content
    const delay = Math.min(8, Math.max(2, 200 / fullContent.length))

    let currentCharIndex = 0
    const lineId = line.id

    setLines(prev => [...prev, { ...line, content: '' }])

    const interval = setInterval(() => {
      currentCharIndex += 2 // type 2 chars at a time for speed
      if (currentCharIndex >= fullContent.length) {
        clearInterval(interval)
        setLines(prev =>
          prev.map(l => l.id === lineId ? { ...l, content: fullContent } : l)
        )
        isTypingRef.current = false
        setIsTyping(false)

        // Process next in queue
        if (typingQueueRef.current.length > 0) {
          setTimeout(processTypingQueue, 30)
        }
      } else {
        setLines(prev =>
          prev.map(l => l.id === lineId ? { ...l, content: fullContent.slice(0, currentCharIndex) } : l)
        )
      }
    }, delay)
  }, [])

  const addOutputLine = useCallback((
    type: TerminalLine['type'],
    content: string,
    animated = false,
    prompt?: string
  ) => {
    const newLine: TerminalLine = {
      id: crypto.randomUUID(),
      type,
      content,
      animated,
      prompt,
    }

    if (animated) {
      typingQueueRef.current.push(newLine)
      if (!isTypingRef.current) {
        processTypingQueue()
      }
    } else {
      setLines(prev => [...prev, newLine])
    }
  }, [processTypingQueue])

  // ─── Matrix animation ────────────────────────────────────────────────────

  const startMatrix = useCallback(() => {
    setIsMatrixActive(true)
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF'
    let frame = 0
    const maxFrames = 20

    const interval = setInterval(() => {
      const row: string[] = []
      for (let i = 0; i < 60; i++) {
        row.push(chars[Math.floor(Math.random() * chars.length)])
      }
      setMatrixChars(row)
      frame++

      if (frame >= maxFrames) {
        clearInterval(interval)
        setIsMatrixActive(false)
        setMatrixChars([])
        addOutputLine('success', 'Matrix rain complete. Welcome back to reality. 🐇', false)
      }
    }, 50)
  }, [addOutputLine])

  // ─── Command execution ───────────────────────────────────────────────────

  const executeCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim()
    const parts = trimmed.split(/\s+/)
    const command = parts[0]?.toLowerCase() || ''
    const args = parts.slice(1)

    // Add the input line
    const inputLine: TerminalLine = {
      id: crypto.randomUUID(),
      type: 'input',
      content: trimmed,
      prompt: PROMPT,
    }
    setLines(prev => [...prev, inputLine])

    if (!command) return

    // Add to history
    setCommandHistory(prev => [trimmed, ...prev])
    setHistoryIndex(-1)

    // ─── Clear ────────────────────────────────────────────────────────────

    if (command === 'clear') {
      setLines([])
      return
    }

    // ─── Theme ────────────────────────────────────────────────────────────

    if (command === 'theme') {
      const currentIdx = THEME_ORDER.indexOf(theme)
      const nextIdx = (currentIdx + 1) % THEME_ORDER.length
      const nextTheme = THEME_ORDER[nextIdx]
      setTheme(nextTheme)
      addOutputLine(
        'success',
        `Theme changed to ${THEME_COLORS[nextTheme].name} ◈`,
        true
      )
      return
    }

    // ─── Matrix ───────────────────────────────────────────────────────────

    if (command === 'matrix') {
      startMatrix()
      return
    }

    // ─── Fortune ──────────────────────────────────────────────────────────

    if (command === 'fortune') {
      const fortunes = terminalCommands.fortune as unknown as string[]
      const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)]
      addOutputLine('output', randomFortune, true)
      return
    }

    // ─── Cat ──────────────────────────────────────────────────────────────

    if (command === 'cat') {
      if (!args[0]) {
        addOutputLine('error', "cat: missing file operand. Try: cat about, cat skills, cat projects, etc.", true)
        return
      }
      const file = args[0].toLowerCase()
      if (CAT_VALID_FILES.includes(file) && terminalCommands[file]) {
        addOutputLine('output', terminalCommands[file] as string, true)
      } else if (file === '.secret') {
        addOutputLine('warning', '🐱 You found a secret file! Konami code: ↑↑↓↓←→←→BA', true)
      } else if (file === 'readme.md') {
        addOutputLine('output', `# SRIRAM.OS\n## Interactive AI Operating System Portfolio\n\nWelcome to Sriram V's interactive portfolio.\nType 'help' to get started.\n\nBuilt with ❤️ and AI.`, true)
      } else {
        addOutputLine('error', `cat: ${args[0]}: No such file or directory`, true)
      }
      return
    }

    // ─── Open ─────────────────────────────────────────────────────────────

    if (command === 'open') {
      if (!args[0]) {
        addOutputLine('error', "open: missing section. Try: open about, open projects, open skills, etc.", true)
        return
      }
      const section = args[0].toLowerCase()
      const validSections = ['about', 'projects', 'skills', 'experience', 'research', 'contact', 'certifications', 'achievements']
      if (validSections.includes(section)) {
        addOutputLine('success', `Opening ${section}... ◈`, true)
        onOpenSection?.(section)
      } else {
        addOutputLine('error', `open: '${args[0]}' is not a valid section. Available: ${validSections.join(', ')}`, true)
      }
      return
    }

    // ─── GitHub ───────────────────────────────────────────────────────────

    if (command === 'github') {
      addOutputLine('output', '🐙 GitHub: https://github.com/sriram', true)
      addOutputLine('system', '  ↳ Click or copy the link to visit', false)
      return
    }

    // ─── LinkedIn ─────────────────────────────────────────────────────────

    if (command === 'linkedin') {
      addOutputLine('output', '💼 LinkedIn: https://linkedin.com/in/sriram', true)
      addOutputLine('system', '  ↳ Click or copy the link to visit', false)
      return
    }

    // ─── Built-in commands from portfolio-data ────────────────────────────

    if (terminalCommands[command] !== undefined) {
      const output = terminalCommands[command]
      if (typeof output === 'string') {
        addOutputLine(command === 'ascii' ? 'ascii' : 'output', output, true)
      }
      return
    }

    // ─── Unknown command ──────────────────────────────────────────────────

    addOutputLine(
      'error',
      `command not found: ${command}. Type 'help' for available commands.`,
      true
    )
  }, [theme, startMatrix, addOutputLine, onOpenSection])

  // ─── Handle key input ────────────────────────────────────────────────────

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isMatrixActive) return
    if (isTyping) return

    // ─── Tab completion ─────────────────────────────────────────────────

    if (e.key === 'Tab') {
      e.preventDefault()
      const partial = input.trim().toLowerCase()
      if (!partial) return

      const parts = partial.split(/\s+/)
      const currentPart = parts[parts.length - 1]

      if (parts.length === 1) {
        // Command completion
        const matches = AVAILABLE_COMMANDS.filter(cmd => cmd.startsWith(currentPart))
        if (matches.length === 1) {
          setInput(matches[0] + ' ')
          play('type')
        } else if (matches.length > 1) {
          // Show possible completions
          const inputLine: TerminalLine = {
            id: crypto.randomUUID(),
            type: 'input',
            content: input,
            prompt: PROMPT,
          }
          setLines(prev => [...prev, inputLine])
          addOutputLine('system', matches.join('  '), false)
        }
      } else if (parts[0] === 'cat' || parts[0] === 'open') {
        // File/section completion
        const validOptions = parts[0] === 'cat'
          ? [...CAT_VALID_FILES, '.secret', 'readme.md']
          : ['about', 'projects', 'skills', 'experience', 'research', 'contact', 'certifications', 'achievements']
        const matches = validOptions.filter(opt => opt.startsWith(currentPart))
        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0]
          setInput(parts.join(' ') + ' ')
          play('type')
        } else if (matches.length > 1) {
          const inputLine: TerminalLine = {
            id: crypto.randomUUID(),
            type: 'input',
            content: input,
            prompt: PROMPT,
          }
          setLines(prev => [...prev, inputLine])
          addOutputLine('system', matches.join('  '), false)
        }
      }
      return
    }

    // ─── Enter ──────────────────────────────────────────────────────────

    if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = input
      setInput('')
      executeCommand(cmd)
      return
    }

    // ─── Arrow up (history) ─────────────────────────────────────────────

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length === 0) return
      const newIdx = Math.min(historyIndex + 1, commandHistory.length - 1)
      setHistoryIndex(newIdx)
      setInput(commandHistory[newIdx])
      return
    }

    // ─── Arrow down (history) ───────────────────────────────────────────

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      const newIdx = historyIndex - 1
      if (newIdx === -1) {
        setHistoryIndex(-1)
        setInput('')
      } else {
        setHistoryIndex(newIdx)
        setInput(commandHistory[newIdx])
      }
      return
    }

    // ─── Ctrl+C ─────────────────────────────────────────────────────────

    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault()
      const inputLine: TerminalLine = {
        id: crypto.randomUUID(),
        type: 'input',
        content: input + '^C',
        prompt: PROMPT,
      }
      setLines(prev => [...prev, inputLine])
      setInput('')
      return
    }

    // ─── Ctrl+L (clear) ─────────────────────────────────────────────────

    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
      return
    }

    // ─── Typing sound ──────────────────────────────────────────────────

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      play('type')
    }
  }, [input, commandHistory, historyIndex, isMatrixActive, isTyping, executeCommand, play, addOutputLine])

  // ─── Get line color ──────────────────────────────────────────────────────

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return THEME_COLORS[theme].prompt
      case 'output': return '#00E5FF'
      case 'error': return '#FF4444'
      case 'success': return '#00FF88'
      case 'warning': return '#FFD700'
      case 'system': return '#94A3B8'
      case 'ascii': return THEME_COLORS[theme].prompt
      case 'matrix': return '#00FF88'
      default: return '#00E5FF'
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col h-full w-full rounded-lg overflow-hidden select-none"
      style={{ backgroundColor: '#0a0a1a' }}
      onClick={focusInput}
    >
      {/* ─── Title Bar ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b shrink-0"
        style={{
          backgroundColor: '#0f0f2a',
          borderColor: 'rgba(0, 229, 255, 0.1)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <button
              className="w-3 h-3 rounded-full transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#FF5F57' }}
              aria-label="Close"
            />
            <button
              className="w-3 h-3 rounded-full transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#FEBC2E' }}
              aria-label="Minimize"
            />
            <button
              className="w-3 h-3 rounded-full transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#28C840' }}
              aria-label="Maximize"
            />
          </div>
          <span
            className="text-xs font-medium tracking-wide"
            style={{ color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace" }}
          >
            SRIRAM.OS Terminal
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ color: THEME_COLORS[theme].prompt }}>●</span>
          <span>{THEME_COLORS[theme].name}</span>
        </div>
      </div>

      {/* ─── Terminal Output ───────────────────────────────────────────── */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '13px',
          lineHeight: '1.6',
        }}
      >
        {/* Matrix overlay */}
        <AnimatePresence>
          {isMatrixActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center p-4"
              style={{ backgroundColor: '#0a0a1a' }}
            >
              <pre
                className="text-center leading-5"
                style={{
                  color: '#00FF88',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  textShadow: '0 0 5px #00FF88, 0 0 10px #00FF88',
                }}
              >
                {matrixChars.join('')}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terminal lines */}
        {lines.map((line) => (
          <div key={line.id}>
            {line.type === 'input' ? (
              <div className="flex">
                <span style={{ color: THEME_COLORS[theme].prompt, whiteSpace: 'pre' }}>
                  {line.prompt || PROMPT}
                </span>
                <span style={{ color: '#E2E8F0' }}>{line.content}</span>
              </div>
            ) : (
              <pre
                className="whitespace-pre-wrap break-words"
                style={{
                  color: getLineColor(line.type),
                  ...(line.type === 'ascii' ? {
                    textShadow: `0 0 7px ${THEME_COLORS[theme].prompt}`,
                  } : {}),
                  ...(line.type === 'success' ? {
                    textShadow: '0 0 5px rgba(0, 255, 136, 0.5)',
                  } : {}),
                  ...(line.type === 'error' ? {
                    textShadow: '0 0 5px rgba(255, 68, 68, 0.5)',
                  } : {}),
                  ...(line.type === 'warning' ? {
                    textShadow: '0 0 5px rgba(255, 215, 0, 0.5)',
                  } : {}),
                }}
              >
                {line.content}
              </pre>
            )}
          </div>
        ))}

        {/* ─── Input Line ──────────────────────────────────────────────── */}
        {!isMatrixActive && (
          <div className="flex items-center">
            <span style={{ color: THEME_COLORS[theme].prompt, whiteSpace: 'pre' }}>
              {PROMPT}
            </span>
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none outline-none"
                style={{
                  color: '#E2E8F0',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '13px',
                  caretColor: THEME_COLORS[theme].prompt,
                  caretShape: 'block',
                }}
                disabled={isMatrixActive}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                aria-label="Terminal input"
              />
            </div>
            {/* Blinking cursor */}
            {input.length === 0 && !isTyping && (
              <span
                className="terminal-cursor"
                style={{
                  color: THEME_COLORS[theme].prompt,
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                █
              </span>
            )}
          </div>
        )}
      </div>

      {/* ─── Status Bar ────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-1 text-xs border-t shrink-0"
        style={{
          backgroundColor: '#0f0f2a',
          borderColor: 'rgba(0, 229, 255, 0.1)',
          color: '#4A5568',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <span>bash 5.2.0</span>
        <span>{lines.length} lines</span>
        <span>UTF-8</span>
      </div>
    </div>
  )
}
