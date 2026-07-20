'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WindowProps {
  id: string
  title: string
  icon?: string
  isActive: boolean
  onClose: () => void
  onFocus: () => void
  onMinimize: () => void
  children: React.ReactNode
  width?: number
  height?: number
  color?: string
  zIndex?: number
}

export default function Window({
  id,
  title,
  icon,
  isActive,
  onClose,
  onFocus,
  onMinimize,
  children,
  width = 700,
  height = 500,
  color = '#00E5FF',
  zIndex = 10,
}: WindowProps) {
  const [position, setPosition] = useState(() => {
    if (typeof window === 'undefined') return { x: 100, y: 80 }
    const cx = Math.max(40, (window.innerWidth - width) / 2 + (id.charCodeAt(0) % 3) * 40 - 30)
    const cy = Math.max(20, (window.innerHeight - height) / 2 + (id.charCodeAt(1) % 3) * 30 - 15)
    return { x: cx, y: cy }
  })
  const [size, setSize] = useState({ w: width, h: height })
  const [isMaximized, setIsMaximized] = useState(false)
  const [preMaxState, setPreMaxState] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [hoverBtn, setHoverBtn] = useState<string | null>(null)

  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null)
  const windowRef = useRef<HTMLDivElement>(null)

  // ─── Drag handlers ───────────────────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return
    e.preventDefault()
    onFocus()
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origY: position.y,
    }
  }, [position, isMaximized, onFocus])

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      const newX = dragRef.current.origX + dx
      const newY = Math.max(0, dragRef.current.origY + dy)
      const maxX = window.innerWidth - 100
      const maxY = window.innerHeight - 48
      setPosition({
        x: Math.min(newX, maxX),
        y: Math.min(newY, maxY),
      })
    }

    const handleUp = () => {
      setIsDragging(false)
      dragRef.current = null
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [isDragging])

  // ─── Resize handlers ─────────────────────────────────────────────────────────

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return
    e.preventDefault()
    e.stopPropagation()
    onFocus()
    setIsResizing(true)
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: size.w,
      origH: size.h,
    }
  }, [size, isMaximized, onFocus])

  useEffect(() => {
    if (!isResizing) return

    const handleMove = (e: MouseEvent) => {
      if (!resizeRef.current) return
      const dx = e.clientX - resizeRef.current.startX
      const dy = e.clientY - resizeRef.current.startY
      setSize({
        w: Math.max(400, resizeRef.current.origW + dx),
        h: Math.max(300, resizeRef.current.origH + dy),
      })
    }

    const handleUp = () => {
      setIsResizing(false)
      resizeRef.current = null
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [isResizing])

  // ─── Maximize toggle ─────────────────────────────────────────────────────────

  const handleMaximize = useCallback(() => {
    if (isMaximized && preMaxState) {
      setPosition({ x: preMaxState.x, y: preMaxState.y })
      setSize({ w: preMaxState.w, h: preMaxState.h })
      setPreMaxState(null)
      setIsMaximized(false)
    } else {
      setPreMaxState({ x: position.x, y: position.y, w: size.w, h: size.h })
      setPosition({ x: 0, y: 0 })
      setSize({ w: window.innerWidth, h: window.innerHeight - 48 })
      setIsMaximized(true)
    }
  }, [isMaximized, preMaxState, position, size])

  // ─── Double-click title bar to maximize ──────────────────────────────────────

  const handleTitleDoubleClick = useCallback(() => {
    handleMaximize()
  }, [handleMaximize])

  return (
    <AnimatePresence>
      <motion.div
        ref={windowRef}
        id={`window-${id}`}
        className="absolute flex flex-col select-none"
        style={{
          left: position.x,
          top: position.y,
          width: size.w,
          height: size.h,
          zIndex: zIndex,
          ...(isMaximized ? { borderRadius: 0 } : { borderRadius: 12 }),
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.25 }}
        onPointerDown={onFocus}
      >
        {/* ─── Window Shadow ────────────────────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: isActive
              ? `0 8px 32px rgba(0,0,0,0.5), 0 0 30px ${color}25, 0 0 60px ${color}10`
              : '0 4px 16px rgba(0,0,0,0.3)',
            borderRadius: isMaximized ? 0 : 12,
          }}
        />

        {/* ─── Window Border Glow ────────────────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: isMaximized ? 0 : 12,
            border: isActive
              ? `1.5px solid ${color}60`
              : '1px solid rgba(148,163,184,0.15)',
            boxShadow: isActive
              ? `inset 0 0 20px ${color}08, 0 0 1px ${color}40`
              : 'none',
            transition: 'border-color 300ms, box-shadow 300ms',
          }}
        />

        {/* ─── Window Content ────────────────────────────────────────────────── */}
        <div
          className="relative flex flex-col w-full h-full overflow-hidden"
          style={{
            borderRadius: isMaximized ? 0 : 12,
            background: 'rgba(10, 15, 40, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* ─── Title Bar ─────────────────────────────────────────────────────── */}
          <div
            className="window-drag flex items-center justify-between px-4 h-10 shrink-0"
            style={{
              background: isActive
                ? 'linear-gradient(180deg, rgba(15,20,50,0.95) 0%, rgba(10,15,40,0.9) 100%)'
                : 'rgba(10,15,40,0.7)',
              borderBottom: `1px solid ${isActive ? color + '20' : 'rgba(148,163,184,0.08)'}`,
            }}
            onMouseDown={handleDragStart}
            onDoubleClick={handleTitleDoubleClick}
          >
            {/* Traffic lights */}
            <div className="flex items-center gap-2 z-10">
              {/* Close */}
              <button
                className="group flex items-center justify-center w-3.5 h-3.5 rounded-full transition-all duration-150"
                style={{
                  backgroundColor: isActive || hoverBtn === 'close' ? '#FF5F57' : '#6B4040',
                  boxShadow: hoverBtn === 'close' ? '0 0 6px rgba(255,95,87,0.5)' : 'none',
                }}
                onClick={(e) => { e.stopPropagation(); onClose() }}
                onMouseEnter={() => setHoverBtn('close')}
                onMouseLeave={() => setHoverBtn(null)}
                aria-label="Close window"
              >
                {hoverBtn === 'close' && (
                  <svg width="6" height="6" viewBox="0 0 6 6" className="opacity-80">
                    <path d="M0.5 0.5L5.5 5.5M5.5 0.5L0.5 5.5" stroke="#4A0002" strokeWidth="1" />
                  </svg>
                )}
              </button>
              {/* Minimize */}
              <button
                className="group flex items-center justify-center w-3.5 h-3.5 rounded-full transition-all duration-150"
                style={{
                  backgroundColor: isActive || hoverBtn === 'min' ? '#FEBC2E' : '#6B6040',
                  boxShadow: hoverBtn === 'min' ? '0 0 6px rgba(254,188,46,0.5)' : 'none',
                }}
                onClick={(e) => { e.stopPropagation(); onMinimize() }}
                onMouseEnter={() => setHoverBtn('min')}
                onMouseLeave={() => setHoverBtn(null)}
                aria-label="Minimize window"
              >
                {hoverBtn === 'min' && (
                  <svg width="6" height="2" viewBox="0 0 6 2" className="opacity-80">
                    <rect x="0.5" y="0.5" width="5" height="1" fill="#5A3E00" />
                  </svg>
                )}
              </button>
              {/* Maximize */}
              <button
                className="group flex items-center justify-center w-3.5 h-3.5 rounded-full transition-all duration-150"
                style={{
                  backgroundColor: isActive || hoverBtn === 'max' ? '#28C840' : '#406B40',
                  boxShadow: hoverBtn === 'max' ? '0 0 6px rgba(40,200,64,0.5)' : 'none',
                }}
                onClick={(e) => { e.stopPropagation(); handleMaximize() }}
                onMouseEnter={() => setHoverBtn('max')}
                onMouseLeave={() => setHoverBtn(null)}
                aria-label="Maximize window"
              >
                {hoverBtn === 'max' && (
                  <svg width="5" height="5" viewBox="0 0 5 5" className="opacity-80">
                    <rect x="0.5" y="0.5" width="4" height="4" fill="#005500" strokeWidth="0.5" />
                  </svg>
                )}
              </button>
            </div>

            {/* Title */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
              {icon && <span className="text-sm">{icon}</span>}
              <span
                className="font-jetbrains text-xs tracking-wide truncate max-w-[200px]"
                style={{
                  color: isActive ? color : '#94A3B8',
                  textShadow: isActive ? `0 0 8px ${color}40` : 'none',
                }}
              >
                {title}
              </span>
            </div>

            {/* Spacer for right side balance */}
            <div className="w-14" />
          </div>

          {/* ─── Content Area ──────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-hidden relative">
            {children}
          </div>
        </div>

        {/* ─── Resize Handle ──────────────────────────────────────────────────── */}
        {!isMaximized && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10"
            onMouseDown={handleResizeStart}
            style={{
              // Visual indicator
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              className="absolute bottom-1 right-1 opacity-30 hover:opacity-60 transition-opacity"
            >
              <path d="M10 2L2 10M10 6L6 10M10 10L10 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
