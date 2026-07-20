'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'

/* ═══════════════════ Types ═══════════════════ */

interface PixelWorldProps {
  onBuildingClick: (buildingId: string) => void
}

interface BuildingData {
  id: string
  name: string
  color: string
  glowColor: string
  x: number
  y: number
  w: number
  h: number
  style: 'futuristic' | 'industrial' | 'academic' | 'tech' | 'nature' | 'comms'
}

interface NPCData {
  id: string
  x: number
  y: number
  type: 'robot' | 'scientist'
  message: string
  color: string
  buildingId?: string  // Which building this guide is for
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

/* ═══════════════════ Constants ═══════════════════ */

const WORLD_W = 2400
const WORLD_H = 1800
const PIXEL_SCALE = 1.3
const CHAR_SPEED = 4
const INTERACT_DIST = 85
const NPC_DIST = 120
const CAM_LERP = 0.08

/* ═══════════════════ Game Data ═══════════════════ */

const BUILDINGS: BuildingData[] = [
  { id: 'ai-lab', name: 'AI LAB', color: '#00695C', glowColor: '#00E5FF', x: 180, y: 100, w: 200, h: 150, style: 'futuristic' },
  { id: 'projects', name: 'PROJECTS', color: '#4A148C', glowColor: '#E040FB', x: 880, y: 100, w: 210, h: 150, style: 'tech' },
  { id: 'experience', name: 'EXPERIENCE', color: '#880E4F', glowColor: '#FF4081', x: 1560, y: 100, w: 200, h: 150, style: 'industrial' },
  { id: 'skills', name: 'SKILLS', color: '#1B5E20', glowColor: '#69F0AE', x: 180, y: 1050, w: 200, h: 150, style: 'academic' },
  { id: 'research', name: 'RESEARCH', color: '#E65100', glowColor: '#FFD740', x: 880, y: 1050, w: 210, h: 150, style: 'academic' },
  { id: 'contact', name: 'CONTACT', color: '#BF360C', glowColor: '#FFAB40', x: 1560, y: 1050, w: 200, h: 150, style: 'comms' },
]

const NPCS: NPCData[] = [
  // ── Guides near each building entrance ──
  // AI LAB guide (building: x:180, y:100, w:200, h:150 → door center ~280, bottom ~250)
  { id: 'r1', x: 320, y: 285, type: 'robot', message: 'AI LAB — Enter to explore ML & AI!', color: '#00E5FF', buildingId: 'ai-lab' },
  // PROJECTS guide (building: x:880, y:100, w:210, h:150 → door center ~985, bottom ~250)
  { id: 's1', x: 1020, y: 285, type: 'scientist', message: 'PROJECTS — See what I built!', color: '#E040FB', buildingId: 'projects' },
  // EXPERIENCE guide (building: x:1560, y:100, w:200, h:150 → door center ~1660, bottom ~250)
  { id: 'r2', x: 1700, y: 285, type: 'robot', message: 'EXPERIENCE — My work history!', color: '#FF4081', buildingId: 'experience' },
  // SKILLS guide (building: x:180, y:1050, w:200, h:150 → door center ~280, bottom ~1200)
  { id: 's2', x: 320, y: 1235, type: 'scientist', message: 'SKILLS — Tech stack & tools!', color: '#69F0AE', buildingId: 'skills' },
  // RESEARCH guide (building: x:880, y:1050, w:210, h:150 → door center ~985, bottom ~1200)
  { id: 'r3', x: 1020, y: 1235, type: 'robot', message: 'RESEARCH — Papers & publications!', color: '#FFD740', buildingId: 'research' },
  // CONTACT guide (building: x:1560, y:1050, w:200, h:150 → door center ~1660, bottom ~1200)
  { id: 's3', x: 1700, y: 1235, type: 'scientist', message: 'CONTACT — Let\'s connect!', color: '#FFAB40', buildingId: 'contact' },
  // Central welcome guide at monument (monument at ~1160, 820)
  { id: 'r4', x: 1130, y: 870, type: 'robot', message: 'Welcome to SRIRAM.OS! Explore the labs!', color: '#00E5FF' },
]

const PATHS = [
  { x: 180, y: 240, w: 1580, h: 20 },
  { x: 180, y: 1190, w: 1580, h: 20 },
  { x: 270, y: 240, w: 20, h: 950 },
  { x: 960, y: 240, w: 20, h: 950 },
  { x: 1640, y: 240, w: 20, h: 950 },
  { x: 270, y: 710, w: 1390, h: 20 },
]

/* ═══════════════════ Interactive Objects ═══════════════════ */

interface CrystalData {
  id: string
  x: number
  y: number
  color: string
  label: string
  collected: boolean
}

interface BoostPadData {
  x: number
  y: number
  color: string
}

interface TeleporterData {
  id: string
  x: number
  y: number
  targetId: string
  color: string
}

const CRYSTALS: CrystalData[] = [
  { id: 'c1', x: 540, y: 300, color: '#00E5FF', label: 'AI Core', collected: false },
  { id: 'c2', x: 1200, y: 450, color: '#E040FB', label: 'Data Node', collected: false },
  { id: 'c3', x: 750, y: 800, color: '#69F0AE', label: 'Skill Gem', collected: false },
  { id: 'c4', x: 1400, y: 700, color: '#FF4081', label: 'Exp Crystal', collected: false },
  { id: 'c5', x: 400, y: 1300, color: '#FFD740', label: 'Research Orb', collected: false },
  { id: 'c6', x: 1050, y: 1400, color: '#FFAB40', label: 'Contact Link', collected: false },
  { id: 'c7', x: 1700, y: 400, color: '#00E5FF', label: 'Neural Chip', collected: false },
  { id: 'c8', x: 600, y: 600, color: '#E040FB', label: 'Logic Gate', collected: false },
  { id: 'c9', x: 1300, y: 1100, color: '#69F0AE', label: 'Quantum Bit', collected: false },
  { id: 'c10', x: 1100, y: 900, color: '#FFD740', label: 'Gold Token', collected: false },
]

const BOOST_PADS: BoostPadData[] = [
  { x: 540, y: 710, color: '#00E5FF' },
  { x: 1200, y: 710, color: '#E040FB' },
  { x: 780, y: 1190, color: '#69F0AE' },
]

const TELEPORTERS: TeleporterData[] = [
  { id: 'tp1', x: 180, y: 450, targetId: 'tp2', color: '#00E5FF' },
  { id: 'tp2', x: 1650, y: 1300, targetId: 'tp1', color: '#E040FB' },
]

/* ═══════════════════ Seeded Random Generators ═══════════════════ */

function makeRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
}

function genGrass() {
  const r = makeRng(42)
  const out: { x: number; y: number; w: number; h: number; s: number }[] = []
  for (let i = 0; i < 800; i++) {
    out.push({ x: (r() * WORLD_W) | 0, y: (r() * WORLD_H) | 0, w: (r() * 12 + 4) | 0, h: (r() * 8 + 3) | 0, s: (r() * 5) | 0 })
  }
  return out
}

function genStars() {
  const r = makeRng(77)
  const out: { x: number; y: number; b: number; spd: number; size: number }[] = []
  for (let i = 0; i < 200; i++) {
    out.push({ x: (r() * WORLD_W * 2) | 0, y: (r() * WORLD_H * 2) | 0, b: r(), spd: r() * 0.03 + 0.008, size: (r() * 2 + 1) | 0 })
  }
  return out
}

function genNebulaClouds() {
  const r = makeRng(99)
  const out: { x: number; y: number; rx: number; ry: number; color: string; alpha: number }[] = []
  const cloudColors = ['#00E5FF', '#6C63FF', '#FF00C8', '#1a237e', '#4A148C', '#006064']
  for (let i = 0; i < 16; i++) {
    out.push({
      x: (r() * WORLD_W * 2) | 0,
      y: (r() * WORLD_H * 1.5) | 0,
      rx: (r() * 160 + 80) | 0,
      ry: (r() * 60 + 30) | 0,
      color: cloudColors[(r() * cloudColors.length) | 0],
      alpha: r() * 0.05 + 0.015,
    })
  }
  return out
}

function genMountains() {
  const r = makeRng(555)
  const out: { x: number; h: number; w: number; color: string }[] = []
  const mColors = ['#0d1b3e', '#0f1f47', '#111d3a', '#0a1530']
  for (let i = 0; i < 25; i++) {
    out.push({
      x: (i * 200 + (r() * 80 - 40)) | 0,
      h: (r() * 100 + 50) | 0,
      w: (r() * 160 + 120) | 0,
      color: mColors[(r() * mColors.length) | 0],
    })
  }
  return out
}

function genTrees() {
  const r = makeRng(303)
  const out: { x: number; y: number; size: number }[] = []
  for (let i = 0; i < 50; i++) {
    const tx = (r() * (WORLD_W - 50) + 25) | 0
    const ty = (r() * (WORLD_H - 50) + 25) | 0
    const onPath = PATHS.some(p => tx > p.x - 25 && tx < p.x + p.w + 25 && ty > p.y - 25 && ty < p.y + p.h + 25)
    const onBuilding = BUILDINGS.some(b => tx > b.x - 40 && tx < b.x + b.w + 40 && ty > b.y - 40 && ty < b.y + b.h + 40)
    if (!onPath && !onBuilding) {
      out.push({ x: tx, y: ty, size: (r() * 2 + 1) | 0 })
    }
  }
  return out
}

function genFlowers() {
  const r = makeRng(555)
  const colors = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FF6B9D', '#C7F464', '#AB47BC']
  const out: { x: number; y: number; c: string }[] = []
  for (let i = 0; i < 100; i++) {
    out.push({ x: (r() * WORLD_W) | 0, y: (r() * WORLD_H) | 0, c: colors[(r() * colors.length) | 0] })
  }
  return out
}

function genLamps() {
  return [
    { x: 270, y: 450 }, { x: 270, y: 680 }, { x: 270, y: 920 },
    { x: 960, y: 450 }, { x: 960, y: 680 }, { x: 960, y: 920 },
    { x: 1640, y: 450 }, { x: 1640, y: 680 }, { x: 1640, y: 920 },
    { x: 540, y: 240 }, { x: 780, y: 240 }, { x: 1200, y: 240 },
    { x: 540, y: 1190 }, { x: 780, y: 1190 }, { x: 1200, y: 1190 },
  ]
}

const GRASS = genGrass()
const STARS = genStars()
const NEBULA_CLOUDS = genNebulaClouds()
const MOUNTAINS = genMountains()
const TREES = genTrees()
const FLOWERS = genFlowers()
const LAMPS = genLamps()

const GRASS_SHADES = ['#0a2d50', '#0d365a', '#103f64', '#0b3058', '#0e3a5f']

/* ═══════════════════ Color Helpers ═══════════════════ */

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function darken(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgb(${Math.round(r * factor)},${Math.round(g * factor)},${Math.round(b * factor)})`
}

function lighten(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgb(${Math.min(255, Math.round(r + (255 - r) * factor))},${Math.min(255, Math.round(g + (255 - g) * factor))},${Math.min(255, Math.round(b + (255 - b) * factor))})`
}

/* ═══════════════════ Rounded Rect Helper ═══════════════════ */

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/* ═══════════════════ Draw Stroked Text ═══════════════════ */

function drawStrokedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, strokeW: number = 2, strokeColor: string = '#000000', fillColor: string = '#FFFFFF') {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineWidth = strokeW
  ctx.strokeStyle = strokeColor
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  ctx.strokeText(text, x, y)
  ctx.fillStyle = fillColor
  ctx.fillText(text, x, y)
}

function drawGlowText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, glowColor: string, fillColor: string = '#FFFFFF', fontSize: number = 10) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${fontSize}px monospace`
  // Glow layer
  ctx.save()
  ctx.shadowColor = glowColor
  ctx.shadowBlur = 10
  ctx.fillStyle = glowColor
  ctx.fillText(text, x, y)
  ctx.restore()
  // Outline
  ctx.font = `bold ${fontSize}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineWidth = 2.5
  ctx.strokeStyle = 'rgba(0,0,0,0.8)'
  ctx.lineJoin = 'round'
  ctx.strokeText(text, x, y)
  // Main fill
  ctx.fillStyle = fillColor
  ctx.fillText(text, x, y)
}

/* ═══════════════════ Background Drawing ═══════════════════ */

function drawBackground(ctx: CanvasRenderingContext2D, vw: number, vh: number, camX: number, camY: number, time: number) {
  // Deep space gradient
  const grad = ctx.createLinearGradient(0, 0, 0, vh)
  grad.addColorStop(0, '#030712')
  grad.addColorStop(0.3, '#070d1f')
  grad.addColorStop(0.6, '#0a1030')
  grad.addColorStop(1, '#0e1545')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, vw, vh)

  // Nebula clouds (parallax 0.12x)
  for (const cloud of NEBULA_CLOUDS) {
    const cx = (cloud.x * 0.12 - camX * 0.12) | 0
    const cy = (cloud.y * 0.12 - camY * 0.12) | 0
    if (cx + cloud.rx < -20 || cx - cloud.rx > vw + 20 || cy + cloud.ry < -20 || cy - cloud.ry > vh + 20) continue
    const rgb = hexToRgb(cloud.color)
    const alpha = cloud.alpha + Math.sin(time * 0.001 + cloud.x * 0.01) * 0.006
    const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cloud.rx)
    cGrad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${(alpha + 0.03).toFixed(3)})`)
    cGrad.addColorStop(0.4, `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha.toFixed(3)})`)
    cGrad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`)
    ctx.fillStyle = cGrad
    ctx.beginPath()
    ctx.ellipse(cx, cy, cloud.rx, cloud.ry, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // Distant mountains (parallax 0.2x)
  for (const mt of MOUNTAINS) {
    const mx = (mt.x * 0.2 - camX * 0.2) | 0
    const my = (vh * 0.6 - camY * 0.2) | 0
    if (mx + mt.w < -10 || mx > vw + 10) continue
    ctx.fillStyle = mt.color
    ctx.beginPath()
    ctx.moveTo(mx, my)
    ctx.lineTo(mx + mt.w * 0.45, my - mt.h)
    ctx.lineTo(mx + mt.w * 0.55, my - mt.h * 0.9)
    ctx.lineTo(mx + mt.w, my)
    ctx.closePath()
    ctx.fill()
    // Mountain snow cap
    ctx.fillStyle = 'rgba(0,229,255,0.04)'
    ctx.beginPath()
    ctx.moveTo(mx + mt.w * 0.4, my - mt.h * 0.7)
    ctx.lineTo(mx + mt.w * 0.45, my - mt.h)
    ctx.lineTo(mx + mt.w * 0.55, my - mt.h * 0.9)
    ctx.lineTo(mx + mt.w * 0.6, my - mt.h * 0.6)
    ctx.closePath()
    ctx.fill()
  }

  // Stars (parallax 0.35x)
  for (const st of STARS) {
    const sx = (st.x * 0.35 - camX * 0.35) | 0
    const sy = (st.y * 0.35 - camY * 0.35) | 0
    if (sx < -4 || sx > vw + 4 || sy < -4 || sy > vh + 4) continue
    const brightness = (Math.sin(time * st.spd * 60 + st.b * 100) + 1) / 2
    const alpha = 0.3 + brightness * 0.7
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`
    const s = st.size
    if (s > 1.5 && brightness > 0.5) {
      // Bright star with cross sparkle
      ctx.fillRect(sx, sy, 2, 2)
      ctx.fillStyle = `rgba(255,255,255,${(alpha * 0.25).toFixed(2)})`
      ctx.fillRect(sx - 2, sy + 0.5, 6, 1)
      ctx.fillRect(sx + 0.5, sy - 2, 1, 6)
    } else {
      ctx.fillRect(sx, sy, s > 1 ? 2 : 1, s > 1 ? 2 : 1)
    }
  }

  // Atmospheric fog at bottom
  const fogGrad = ctx.createLinearGradient(0, vh * 0.8, 0, vh)
  fogGrad.addColorStop(0, 'rgba(10,15,40,0)')
  fogGrad.addColorStop(1, 'rgba(10,15,40,0.3)')
  ctx.fillStyle = fogGrad
  ctx.fillRect(0, vh * 0.8, vw, vh * 0.2)
}

/* ═══════════════════ Ground Drawing ═══════════════════ */

function drawGround(ctx: CanvasRenderingContext2D, vw: number, vh: number, camX: number, camY: number) {
  // Grass patches with texture
  for (const g of GRASS) {
    const gx = (g.x - camX) | 0
    const gy = (g.y - camY) | 0
    if (gx < -16 || gx > vw + 16 || gy < -16 || gy > vh + 16) continue
    ctx.fillStyle = GRASS_SHADES[g.s]
    ctx.fillRect(gx, gy, g.w, g.h)
    // Grass blade highlights
    if (g.s % 2 === 0 && g.w > 5) {
      ctx.fillStyle = 'rgba(0,229,255,0.025)'
      ctx.fillRect(gx + 1, gy, 1, g.h)
    }
  }

  // Paths with realistic pavement texture
  for (const p of PATHS) {
    const px = (p.x - camX) | 0
    const py = (p.y - camY) | 0
    if (px > vw + p.w || px + p.w < 0 || py > vh + p.h || py + p.h < 0) continue
    // Base path with gradient
    const pathGrad = ctx.createLinearGradient(px, py, px, py + p.h)
    pathGrad.addColorStop(0, '#3d3d6b')
    pathGrad.addColorStop(0.5, '#2c2c54')
    pathGrad.addColorStop(1, '#3d3d6b')
    ctx.fillStyle = pathGrad
    ctx.fillRect(px, py, p.w, p.h)
    // Top curb edge
    ctx.fillStyle = '#4a4a7a'
    ctx.fillRect(px, py, p.w, 2)
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(px, py, p.w, 1)
    // Bottom curb edge
    ctx.fillStyle = '#1a1a3e'
    ctx.fillRect(px, py + p.h - 2, p.w, 2)
    // Paving stone pattern
    ctx.fillStyle = 'rgba(61,61,107,0.3)'
    for (let cx = px + 5; cx < px + p.w - 5; cx += 10) {
      for (let cy = py + 3; cy < py + p.h - 3; cy += 6) {
        ctx.fillRect(cx + (cy % 2) * 5, cy, 8, 4)
      }
    }
    // Center guide line with glow
    ctx.fillStyle = 'rgba(0,229,255,0.04)'
    ctx.fillRect(px + 3, py + p.h / 2 - 1, p.w - 6, 2)
    // Edge glow lines
    ctx.fillStyle = 'rgba(0,229,255,0.06)'
    ctx.fillRect(px + 3, py + 2, p.w - 6, 1)
    ctx.fillRect(px + 3, py + p.h - 3, p.w - 6, 1)
  }
}

function drawFlowers(ctx: CanvasRenderingContext2D, vw: number, vh: number, camX: number, camY: number) {
  for (const f of FLOWERS) {
    const fx = (f.x - camX) | 0
    const fy = (f.y - camY) | 0
    if (fx < -8 || fx > vw + 8 || fy < -8 || fy > vh + 8) continue
    ctx.fillStyle = '#2E7D32'
    ctx.fillRect(fx, fy + 3, 1, 4)
    ctx.fillStyle = f.c
    ctx.fillRect(fx - 1, fy, 3, 4)
    ctx.fillRect(fx, fy - 1, 1, 1)
    ctx.fillStyle = '#FFF9C4'
    ctx.fillRect(fx, fy + 1, 1, 1)
  }
}

function drawTree(ctx: CanvasRenderingContext2D, tree: { x: number; y: number; size: number }, camX: number, camY: number, vw: number, vh: number) {
  const tx = (tree.x - camX) | 0
  const ty = (tree.y - camY) | 0
  if (tx < -30 || tx > vw + 30 || ty < -45 || ty > vh + 10) return
  const s = tree.size
  // Shadow on ground
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.beginPath()
  ctx.ellipse(tx + 4 * s, ty + 2, 8 * s, 3 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  // Trunk with bark texture
  const trunkGrad = ctx.createLinearGradient(tx + 3 * s, ty - 4, tx + 5 * s, ty - 4)
  trunkGrad.addColorStop(0, '#4E342E')
  trunkGrad.addColorStop(0.5, '#5D4037')
  trunkGrad.addColorStop(1, '#3E2723')
  ctx.fillStyle = trunkGrad
  ctx.fillRect(tx + 3 * s, ty - 4, 2 * s, 12 * s)
  // Bark detail
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.fillRect(tx + 3 * s, ty + 2 * s, 2 * s, 1)
  ctx.fillRect(tx + 3 * s, ty + 5 * s, 2 * s, 1)
  // Canopy - overlapping circles for natural shape
  ctx.fillStyle = '#1B5E20'
  ctx.beginPath()
  ctx.arc(tx + 4 * s, ty - 8 * s, 7 * s, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#2E7D32'
  ctx.beginPath()
  ctx.arc(tx + 2 * s, ty - 10 * s, 5 * s, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(tx + 6 * s, ty - 10 * s, 5 * s, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#388E3C'
  ctx.beginPath()
  ctx.arc(tx + 4 * s, ty - 12 * s, 4 * s, 0, Math.PI * 2)
  ctx.fill()
  // Canopy highlight
  ctx.fillStyle = 'rgba(105,240,174,0.1)'
  ctx.beginPath()
  ctx.arc(tx + 2 * s, ty - 10 * s, 3 * s, 0, Math.PI * 2)
  ctx.fill()
  // Canopy shadow (bottom)
  ctx.fillStyle = 'rgba(0,0,0,0.1)'
  ctx.beginPath()
  ctx.arc(tx + 4 * s, ty - 6 * s, 5 * s, 0, Math.PI)
  ctx.fill()
}

function drawLamp(ctx: CanvasRenderingContext2D, lamp: { x: number; y: number }, camX: number, camY: number, vw: number, vh: number, time: number) {
  const lx = (lamp.x - camX) | 0
  const ly = (lamp.y - camY) | 0
  if (lx < -16 || lx > vw + 16 || ly < -30 || ly > vh + 10) return

  // Pole
  ctx.fillStyle = '#546E7A'
  ctx.fillRect(lx, ly - 20, 3, 20)
  ctx.fillStyle = '#37474F'
  ctx.fillRect(lx - 1, ly - 2, 5, 3)

  // Light fixture
  ctx.fillStyle = '#455A64'
  ctx.fillRect(lx - 4, ly - 23, 11, 4)
  ctx.fillStyle = '#FFF9C4'
  ctx.fillRect(lx - 2, ly - 21, 7, 3)

  // Warm glow cone
  const flicker = 0.14 + Math.sin(time * 0.008 + lamp.x) * 0.05
  ctx.fillStyle = `rgba(255,249,196,${flicker.toFixed(3)})`
  ctx.beginPath()
  ctx.moveTo(lx - 3, ly - 18)
  ctx.lineTo(lx - 14, ly + 6)
  ctx.lineTo(lx + 14, ly + 6)
  ctx.lineTo(lx + 6, ly - 18)
  ctx.closePath()
  ctx.fill()

  // Radial glow
  const glowGrad = ctx.createRadialGradient(lx + 1, ly - 20, 0, lx + 1, ly - 20, 24)
  glowGrad.addColorStop(0, `rgba(255,249,196,${(flicker * 0.9).toFixed(3)})`)
  glowGrad.addColorStop(1, 'rgba(255,249,196,0)')
  ctx.fillStyle = glowGrad
  ctx.fillRect(lx - 24, ly - 44, 50, 50)
}

function drawCenterMonument(ctx: CanvasRenderingContext2D, camX: number, camY: number, vw: number, vh: number, time: number) {
  const cx = 1160
  const cy = 820
  const mx = (cx - camX) | 0
  const my = (cy - camY) | 0
  if (mx < -80 || mx > vw + 80 || my < -80 || my > vh + 80) return

  // Plaza floor
  ctx.fillStyle = '#1a237e'
  ctx.fillRect(mx - 40, my + 12, 80, 55)
  ctx.fillStyle = '#283593'
  ctx.fillRect(mx - 35, my + 16, 70, 46)
  // Floor pattern
  ctx.fillStyle = 'rgba(0,229,255,0.06)'
  for (let fy = my + 20; fy < my + 55; fy += 8) {
    ctx.fillRect(mx - 30, fy, 60, 2)
  }

  // Pedestal
  ctx.fillStyle = '#37474F'
  ctx.fillRect(mx - 16, my - 4, 32, 18)
  ctx.fillStyle = '#455A64'
  ctx.fillRect(mx - 14, my - 2, 28, 14)

  // Screen bezel
  ctx.fillStyle = '#263238'
  ctx.fillRect(mx - 14, my - 34, 28, 30)
  // Screen content
  const glow = (Math.sin(time * 0.003) + 1) / 2
  ctx.fillStyle = `rgba(0,229,255,${(0.3 + glow * 0.5).toFixed(2)})`
  ctx.fillRect(mx - 12, my - 32, 24, 26)
  // Scan line
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  const scanY = my - 32 + (time % 50)
  if (scanY < my - 8) ctx.fillRect(mx - 12, scanY, 24, 2)

  // Text on screen
  ctx.font = 'bold 8px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  drawStrokedText(ctx, 'S.OS', mx, my - 19, 2, 'rgba(0,0,0,0.8)', '#FFFFFF')

  // Antenna
  ctx.fillStyle = '#78909C'
  ctx.fillRect(mx, my - 42, 2, 8)
  ctx.fillStyle = '#00E5FF'
  ctx.fillRect(mx - 2, my - 45, 6, 4)
  ctx.fillStyle = `rgba(0,229,255,${(0.15 + glow * 0.15).toFixed(2)})`
  ctx.fillRect(mx - 4, my - 47, 10, 8)
}

/* ═══════════════════ Building Drawing ═══════════════════ */

function drawBuilding(ctx: CanvasRenderingContext2D, b: BuildingData, camX: number, camY: number, vw: number, vh: number, time: number, charX: number, charY: number) {
  const bx = (b.x - camX) | 0
  const by = (b.y - camY) | 0
  if (bx + b.w < -20 || bx > vw + 20 || by + b.h < -40 || by > vh + 20) return

  const bcx = b.x + b.w / 2
  const bcy = b.y + b.h / 2
  const dist = Math.hypot(charX + 10 - bcx, charY + 14 - bcy)
  const isNear = dist < INTERACT_DIST
  const bRgb = hexToRgb(b.color)

  // ── Entrance glow when near ──
  if (isNear) {
    const alpha = Math.min(0.35, (INTERACT_DIST - dist) / INTERACT_DIST * 0.35)
    const glowRgb = hexToRgb(b.glowColor)
    const eGrad = ctx.createRadialGradient(bx + (b.w / 2) | 0, by + b.h, 0, bx + (b.w / 2) | 0, by + b.h, 50)
    eGrad.addColorStop(0, `rgba(${glowRgb.r},${glowRgb.g},${glowRgb.b},${(alpha * 0.8).toFixed(3)})`)
    eGrad.addColorStop(1, `rgba(${glowRgb.r},${glowRgb.g},${glowRgb.b},0)`)
    ctx.fillStyle = eGrad
    ctx.fillRect(bx + ((b.w / 2 - 50) | 0), by + b.h - 40, 100, 42)
  }

  // ── Building shadow on ground ──
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  ctx.fillRect(bx + 6, by + b.h, b.w + 4, 8)

  // ── Concrete foundation ──
  ctx.fillStyle = '#37474F'
  ctx.fillRect(bx - 4, by + b.h - 3, b.w + 8, 6)
  const foundGrad = ctx.createLinearGradient(bx, by + b.h - 3, bx, by + b.h + 3)
  foundGrad.addColorStop(0, '#455A64')
  foundGrad.addColorStop(0.5, '#37474F')
  foundGrad.addColorStop(1, '#263238')
  ctx.fillStyle = foundGrad
  ctx.fillRect(bx - 4, by + b.h - 3, b.w + 8, 6)

  // ── Main wall with gradient ──
  const wallGrad = ctx.createLinearGradient(bx, by, bx + b.w, by + b.h)
  wallGrad.addColorStop(0, lighten(b.color, 0.12))
  wallGrad.addColorStop(0.3, b.color)
  wallGrad.addColorStop(0.7, darken(b.color, 0.9))
  wallGrad.addColorStop(1, darken(b.color, 0.7))
  ctx.fillStyle = wallGrad
  ctx.fillRect(bx, by, b.w, b.h)

  // ── Realistic panel texture ──
  // Horizontal floor lines (story separators)
  ctx.fillStyle = darken(b.color, 0.6)
  for (let row = 0; row < b.h; row += 30) {
    ctx.fillRect(bx, by + row, b.w, 1.5)
    ctx.fillStyle = lighten(b.color, 0.06)
    ctx.fillRect(bx, by + row + 1.5, b.w, 0.5)
    ctx.fillStyle = darken(b.color, 0.6)
  }
  // Vertical panel lines
  ctx.fillStyle = darken(b.color, 0.75)
  for (let col = 0; col < b.w; col += 40) {
    ctx.fillRect(bx + col, by, 1, b.h)
  }

  // ── Ambient occlusion (dark edges) ──
  // Top edge darkening
  const topAoGrad = ctx.createLinearGradient(bx, by, bx, by + 8)
  topAoGrad.addColorStop(0, 'rgba(0,0,0,0.25)')
  topAoGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = topAoGrad
  ctx.fillRect(bx, by, b.w, 8)
  // Bottom edge darkening
  const botAoGrad = ctx.createLinearGradient(bx, by + b.h - 10, bx, by + b.h)
  botAoGrad.addColorStop(0, 'rgba(0,0,0,0)')
  botAoGrad.addColorStop(1, 'rgba(0,0,0,0.3)')
  ctx.fillStyle = botAoGrad
  ctx.fillRect(bx, by + b.h - 10, b.w, 10)

  // ── 3D depth: right side gradient ──
  const sideGrad = ctx.createLinearGradient(bx + b.w - 14, by, bx + b.w, by)
  sideGrad.addColorStop(0, 'rgba(0,0,0,0)')
  sideGrad.addColorStop(0.4, 'rgba(0,0,0,0.12)')
  sideGrad.addColorStop(1, 'rgba(0,0,0,0.3)')
  ctx.fillStyle = sideGrad
  ctx.fillRect(bx + b.w - 14, by, 14, b.h)

  // ── Left edge highlight (light source from left) ──
  const leftGrad = ctx.createLinearGradient(bx, by, bx + 6, by)
  leftGrad.addColorStop(0, 'rgba(255,255,255,0.08)')
  leftGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = leftGrad
  ctx.fillRect(bx, by, 6, b.h)

  // ── Style-specific wall details ──
  if (b.style === 'futuristic') {
    // Glowing circuit lines with gradient
    const circGrad = ctx.createLinearGradient(bx + 8, 0, bx + b.w - 8, 0)
    circGrad.addColorStop(0, 'rgba(0,229,255,0.05)')
    circGrad.addColorStop(0.3, 'rgba(0,229,255,0.3)')
    circGrad.addColorStop(0.7, 'rgba(0,229,255,0.3)')
    circGrad.addColorStop(1, 'rgba(0,229,255,0.05)')
    ctx.fillStyle = circGrad
    ctx.fillRect(bx + 8, by + 28, b.w - 16, 1.5)
    ctx.fillRect(bx + 8, by + 65, b.w - 16, 1.5)
    ctx.fillRect(bx + 8, by + 102, b.w - 16, 1.5)
    // Vertical circuit connectors
    ctx.fillStyle = 'rgba(0,229,255,0.2)'
    ctx.fillRect(bx + 16, by + 28, 1.5, 37)
    ctx.fillRect(bx + b.w - 18, by + 65, 1.5, 37)
    // Circuit nodes with glow
    ctx.save()
    ctx.shadowColor = '#00E5FF'
    ctx.shadowBlur = 4
    ctx.fillStyle = '#00E5FF'
    ctx.fillRect(bx + 14, by + 26, 5, 5)
    ctx.fillRect(bx + b.w - 21, by + 63, 5, 5)
    ctx.restore()
    // Holographic display panel
    const holoAlpha = 0.08 + Math.sin(time * 0.004) * 0.04
    const holoGrad = ctx.createLinearGradient(bx + b.w - 42, by + 10, bx + b.w - 8, by + 36)
    holoGrad.addColorStop(0, `rgba(0,229,255,${(holoAlpha + 0.06).toFixed(3)})`)
    holoGrad.addColorStop(0.5, `rgba(0,229,255,${holoAlpha.toFixed(3)})`)
    holoGrad.addColorStop(1, `rgba(0,229,255,${(holoAlpha + 0.06).toFixed(3)})`)
    ctx.fillStyle = holoGrad
    ctx.fillRect(bx + b.w - 42, by + 10, 34, 26)
    // Scan line on holographic display
    ctx.fillStyle = 'rgba(0,229,255,0.15)'
    ctx.fillRect(bx + b.w - 40, by + 12, 30, 22)
    // Data lines
    ctx.fillStyle = 'rgba(0,229,255,0.35)'
    for (let dy = by + 14; dy < by + 32; dy += 3) {
      const lineW = 8 + Math.sin(time * 0.005 + dy * 0.2) * 5
      ctx.fillRect(bx + b.w - 38, dy, lineW, 1)
    }
  } else if (b.style === 'tech') {
    // Server rack units with depth
    for (let sy = by + 8; sy < by + b.h - 8; sy += 10) {
      const rackGrad = ctx.createLinearGradient(bx + 8, sy, bx + b.w - 8, sy)
      rackGrad.addColorStop(0, 'rgba(224,64,251,0.08)')
      rackGrad.addColorStop(0.5, 'rgba(224,64,251,0.15)')
      rackGrad.addColorStop(1, 'rgba(224,64,251,0.08)')
      ctx.fillStyle = rackGrad
      ctx.fillRect(bx + 8, sy, b.w - 16, 4)
      // Rack bezel highlight
      ctx.fillStyle = 'rgba(224,64,251,0.06)'
      ctx.fillRect(bx + 8, sy, b.w - 16, 1)
    }
    // Rack frame
    ctx.fillStyle = 'rgba(224,64,251,0.1)'
    ctx.fillRect(bx + 8, by + 8, 2, b.h - 16)
    ctx.fillRect(bx + b.w - 10, by + 8, 2, b.h - 16)
    // Status LEDs with glow
    const leds = [[14, 16], [14, 36], [14, 56], [14, 76], [14, 96]]
    for (const [lx, ly] of leds) {
      const ledOn = Math.sin(time * 0.008 + lx + ly) > 0
      if (ledOn) {
        ctx.save()
        ctx.shadowColor = '#00FF88'
        ctx.shadowBlur = 4
        ctx.fillStyle = '#00FF88'
        ctx.fillRect(bx + lx, by + ly, 4, 4)
        ctx.restore()
      } else {
        ctx.fillStyle = '#1B5E20'
        ctx.fillRect(bx + lx, by + ly, 4, 4)
      }
    }
    // Server labels (small text-like bars)
    ctx.fillStyle = 'rgba(224,64,251,0.3)'
    for (let sy = by + 18; sy < by + b.h - 12; sy += 10) {
      ctx.fillRect(bx + 24, sy, 16, 2)
      ctx.fillRect(bx + 24, sy + 3, 10, 1)
    }
  } else if (b.style === 'industrial') {
    // Metal pipes with cylindrical gradient
    for (const pipeOff of [18, 28]) {
      const pipeGrad = ctx.createLinearGradient(bx + b.w - pipeOff - 4, 0, bx + b.w - pipeOff + 4, 0)
      pipeGrad.addColorStop(0, '#455A64')
      pipeGrad.addColorStop(0.3, '#78909C')
      pipeGrad.addColorStop(0.5, '#90A4AE')
      pipeGrad.addColorStop(0.7, '#78909C')
      pipeGrad.addColorStop(1, '#455A64')
      ctx.fillStyle = pipeGrad
      ctx.fillRect(bx + b.w - pipeOff - 4, by + 8, 8, b.h - 16)
    }
    // Pipe joints
    ctx.fillStyle = '#546E7A'
    for (const jy of [14, 50, 86]) {
      ctx.fillRect(bx + b.w - 24, by + jy, 18, 5)
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.fillRect(bx + b.w - 24, by + jy, 18, 1)
      ctx.fillStyle = '#546E7A'
    }
    // Exhaust fan
    ctx.fillStyle = '#263238'
    ctx.fillRect(bx + 10, by + 10, 24, 24)
    const fanGrad = ctx.createRadialGradient(bx + 22, by + 22, 0, bx + 22, by + 22, 10)
    fanGrad.addColorStop(0, '#37474F')
    fanGrad.addColorStop(1, '#1a1a2e')
    ctx.fillStyle = fanGrad
    ctx.fillRect(bx + 12, by + 12, 20, 20)
    // Spinning fan blades
    const fanAngle = time * 0.03
    ctx.strokeStyle = 'rgba(0,229,255,0.25)'
    ctx.lineWidth = 1.5
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(bx + 22, by + 22, 7, fanAngle + i * 2.1, fanAngle + i * 2.1 + 1.2)
      ctx.stroke()
    }
    // Warning stripes
    ctx.fillStyle = 'rgba(255,215,0,0.25)'
    for (let sy = by + b.h - 24; sy < by + b.h - 6; sy += 6) {
      ctx.fillRect(bx + 6, sy, 14, 3)
    }
  } else if (b.style === 'academic') {
    // Bookshelves with wood texture
    for (let sy = by + 10; sy < by + b.h - 10; sy += 16) {
      // Shelf board with gradient
      const shelfGrad = ctx.createLinearGradient(bx + 8, sy + 10, bx + 8, sy + 12)
      shelfGrad.addColorStop(0, 'rgba(139,119,101,0.35)')
      shelfGrad.addColorStop(1, 'rgba(139,119,101,0.15)')
      ctx.fillStyle = shelfGrad
      ctx.fillRect(bx + 8, sy, b.w - 26, 11)
      ctx.fillStyle = 'rgba(139,119,101,0.4)'
      ctx.fillRect(bx + 8, sy + 10, b.w - 26, 2)
      // Books with varied colors
      const bookColors = ['#F44336', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4']
      let bpos = bx + 10
      for (let bi = 0; bi < 8 && bpos < bx + b.w - 30; bi++) {
        const bH = 6 + (bi % 3)
        ctx.fillStyle = bookColors[bi % bookColors.length]
        ctx.fillRect(bpos, sy + 10 - bH, 3, bH)
        ctx.fillStyle = 'rgba(255,255,255,0.1)'
        ctx.fillRect(bpos, sy + 10 - bH, 1, bH)
        bpos += 4
      }
    }
    // Chalkboard
    const chalkGrad = ctx.createLinearGradient(bx + 8, by + 6, bx + 8, by + 30)
    chalkGrad.addColorStop(0, 'rgba(0,77,64,0.35)')
    chalkGrad.addColorStop(1, 'rgba(0,77,64,0.2)')
    ctx.fillStyle = chalkGrad
    ctx.fillRect(bx + 8, by + 6, b.w - 28, 26)
    ctx.strokeStyle = 'rgba(139,119,101,0.5)'
    ctx.lineWidth = 2
    ctx.strokeRect(bx + 8, by + 6, b.w - 28, 26)
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.font = 'bold 7px monospace'
    ctx.textAlign = 'left'
    ctx.fillText('AI/ML', bx + 14, by + 22)
  } else if (b.style === 'comms') {
    // Satellite dish with metallic gradient
    const dishGrad = ctx.createLinearGradient(bx + b.w - 22, by + 10, bx + b.w - 2, by + 30)
    dishGrad.addColorStop(0, '#78909C')
    dishGrad.addColorStop(0.5, '#B0BEC5')
    dishGrad.addColorStop(1, '#78909C')
    ctx.fillStyle = dishGrad
    ctx.fillRect(bx + b.w - 22, by + 10, 20, 8)
    // Dish arm
    ctx.fillStyle = '#546E7A'
    ctx.fillRect(bx + b.w - 12, by + 18, 4, 28)
    // Dish reflector curve
    ctx.fillStyle = '#90A4AE'
    ctx.beginPath()
    ctx.arc(bx + b.w - 12, by + 16, 10, Math.PI * 1.2, Math.PI * 1.8)
    ctx.fill()
    // Signal waves
    const waveAlpha = (Math.sin(time * 0.006) + 1) / 2 * 0.35
    for (let i = 1; i <= 3; i++) {
      ctx.strokeStyle = `rgba(255,171,64,${(waveAlpha / i).toFixed(3)})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(bx + b.w + 2, by + 20, i * 6, -0.5, 0.5)
      ctx.stroke()
    }
    // Antenna array on roof
    for (const ax of [24, 48, 72]) {
      ctx.fillStyle = '#78909C'
      ctx.fillRect(bx + ax, by - 10, 2, 12)
      ctx.fillStyle = '#FFAB40'
      ctx.fillRect(bx + ax - 1, by - 12, 4, 3)
    }
  }

  // ── Windows with glass reflection ──
  const windowGlow = (Math.sin(time * 0.002 + b.x * 0.05) + 1) / 2
  for (let wy = by + 24; wy < by + b.h - 40; wy += 28) {
    for (let wx = bx + 22; wx < bx + b.w - 30; wx += 34) {
      // Window recess (darker frame inset)
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(wx - 3, wy - 3, 20, 20)
      // Window frame
      ctx.fillStyle = '#37474F'
      ctx.fillRect(wx - 2, wy - 2, 18, 18)
      // Glass pane with gradient reflection
      const glassGrad = ctx.createLinearGradient(wx, wy, wx + 14, wy + 14)
      glassGrad.addColorStop(0, `rgba(200,220,255,${(0.35 + windowGlow * 0.25).toFixed(2)})`)
      glassGrad.addColorStop(0.3, `rgba(255,249,196,${(0.25 + windowGlow * 0.2).toFixed(2)})`)
      glassGrad.addColorStop(0.7, `rgba(180,200,240,${(0.15 + windowGlow * 0.15).toFixed(2)})`)
      glassGrad.addColorStop(1, `rgba(100,120,160,${(0.2 + windowGlow * 0.1).toFixed(2)})`)
      ctx.fillStyle = glassGrad
      ctx.fillRect(wx, wy, 14, 14)
      // Cross frame
      ctx.fillStyle = '#37474F'
      ctx.fillRect(wx + 6, wy, 2, 14)
      ctx.fillRect(wx, wy + 6, 14, 2)
      // Specular highlight (top-left bright spot)
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.fillRect(wx + 1, wy + 1, 4, 3)
      // Bottom-right dim reflection
      ctx.fillStyle = 'rgba(100,150,255,0.08)'
      ctx.fillRect(wx + 9, wy + 9, 4, 4)
    }
  }

  // ── Entrance door with canopy ──
  const doorX = bx + ((b.w / 2 - 14) | 0)
  const doorY = by + b.h - 34
  // Door recess
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(doorX - 4, doorY - 4, 36, 38)
  // Door frame
  ctx.fillStyle = '#263238'
  ctx.fillRect(doorX - 2, doorY - 2, 32, 36)
  // Door body with gradient
  const doorGrad = ctx.createLinearGradient(doorX, doorY, doorX + 28, doorY)
  doorGrad.addColorStop(0, '#4E342E')
  doorGrad.addColorStop(0.3, '#5D4037')
  doorGrad.addColorStop(0.7, '#4E342E')
  doorGrad.addColorStop(1, '#3E2723')
  ctx.fillStyle = doorGrad
  ctx.fillRect(doorX, doorY, 28, 32)
  // Door panels with subtle gradient
  const panelGrad = ctx.createLinearGradient(doorX, doorY, doorX, doorY + 32)
  panelGrad.addColorStop(0, 'rgba(255,255,255,0.04)')
  panelGrad.addColorStop(1, 'rgba(0,0,0,0.1)')
  ctx.fillStyle = panelGrad
  ctx.fillRect(doorX + 3, doorY + 3, 9, 11)
  ctx.fillRect(doorX + 15, doorY + 3, 9, 11)
  ctx.fillRect(doorX + 3, doorY + 17, 9, 11)
  ctx.fillRect(doorX + 15, doorY + 17, 9, 11)
  // Door handle (metallic)
  const handleGrad = ctx.createLinearGradient(doorX + 20, doorY + 14, doorX + 24, doorY + 14)
  handleGrad.addColorStop(0, '#FFD740')
  handleGrad.addColorStop(0.5, '#FFF9C4')
  handleGrad.addColorStop(1, '#FFD740')
  ctx.fillStyle = handleGrad
  ctx.fillRect(doorX + 21, doorY + 14, 3, 5)
  // Light above door with glow
  ctx.save()
  ctx.shadowColor = b.glowColor
  ctx.shadowBlur = 8
  ctx.fillStyle = `rgba(255,215,64,${(0.4 + Math.sin(time * 0.003 + b.x) * 0.15).toFixed(2)})`
  ctx.fillRect(doorX + 10, doorY - 4, 10, 3)
  ctx.restore()
  // Entrance canopy/awning
  ctx.fillStyle = darken(b.color, 0.5)
  ctx.fillRect(doorX - 8, doorY - 8, 44, 4)
  ctx.fillStyle = lighten(b.color, 0.1)
  ctx.fillRect(doorX - 8, doorY - 8, 44, 1.5)
  // Canopy shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.fillRect(doorX - 6, doorY - 4, 40, 2)
  // Planter boxes next to door
  ctx.fillStyle = '#5D4037'
  ctx.fillRect(doorX - 10, by + b.h - 6, 8, 6)
  ctx.fillRect(doorX + 30, by + b.h - 6, 8, 6)
  ctx.fillStyle = '#2E7D32'
  ctx.fillRect(doorX - 10, by + b.h - 9, 8, 4)
  ctx.fillRect(doorX + 30, by + b.h - 9, 8, 4)

  // ── Roof with depth ──
  const roofGrad = ctx.createLinearGradient(bx - 8, by - 22, bx - 8, by)
  roofGrad.addColorStop(0, lighten(b.color, 0.15))
  roofGrad.addColorStop(0.3, b.color)
  roofGrad.addColorStop(1, darken(b.color, 0.65))
  ctx.fillStyle = roofGrad
  ctx.fillRect(bx - 8, by - 22, b.w + 16, 24)
  // Roof edge highlight
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  ctx.fillRect(bx - 6, by - 22, b.w + 12, 1.5)
  // Roof bottom edge
  ctx.fillStyle = darken(b.color, 0.55)
  ctx.fillRect(bx - 8, by - 1, b.w + 16, 3)

  // Roof accent glow
  const roofPulse = (Math.sin(time * 0.004 + b.x * 0.1) + 1) / 2
  ctx.save()
  ctx.globalAlpha = 0.3 + roofPulse * 0.5
  ctx.shadowColor = b.glowColor
  ctx.shadowBlur = 6
  ctx.fillStyle = b.glowColor
  ctx.fillRect(bx - 6, by - 20, b.w + 12, 2)
  ctx.restore()
  ctx.globalAlpha = 1

  // Rooftop antenna
  ctx.fillStyle = '#78909C'
  ctx.fillRect(bx + ((b.w / 2) | 0), by - 34, 2, 12)
  const antBlink = Math.sin(time * 0.01 + b.x) > 0.5
  ctx.save()
  if (antBlink) {
    ctx.shadowColor = b.glowColor
    ctx.shadowBlur = 6
  }
  ctx.fillStyle = antBlink ? b.glowColor : darken(b.glowColor, 0.5)
  ctx.fillRect(bx + ((b.w / 2 - 2) | 0), by - 37, 6, 4)
  ctx.restore()

  // ── AC Unit on roof with detail ──
  ctx.fillStyle = '#455A64'
  ctx.fillRect(bx + 12, by - 30, 16, 10)
  const acGrad = ctx.createLinearGradient(bx + 12, by - 30, bx + 28, by - 30)
  acGrad.addColorStop(0, '#546E7A')
  acGrad.addColorStop(0.5, '#607D8B')
  acGrad.addColorStop(1, '#455A64')
  ctx.fillStyle = acGrad
  ctx.fillRect(bx + 13, by - 29, 14, 8)
  // Vent grille
  ctx.fillStyle = '#37474F'
  for (const vx of [bx + 15, bx + 18, bx + 21, bx + 24]) {
    ctx.fillRect(vx, by - 27, 1, 4)
  }

  // ── Neon sign (illuminated acrylic board) ──
  ctx.font = 'bold 11px monospace'
  ctx.textAlign = 'center'
  const signTextW = ctx.measureText(b.name).width
  const signW = Math.max(signTextW + 28, b.w * 0.55)
  const signH = 22
  const signX = bx + ((b.w - signW) / 2) | 0
  const signY = by - 58
  // Sign backplate (thick metallic)
  const backplateGrad = ctx.createLinearGradient(signX, signY - 6, signX, signY + signH + 6)
  backplateGrad.addColorStop(0, '#1a1a2e')
  backplateGrad.addColorStop(0.5, '#2d2d44')
  backplateGrad.addColorStop(1, '#1a1a2e')
  ctx.fillStyle = backplateGrad
  roundRect(ctx, signX - 6, signY - 6, signW + 12, signH + 12, 6)
  ctx.fill()
  // Inner dark backing
  ctx.fillStyle = 'rgba(0,0,0,0.85)'
  roundRect(ctx, signX - 2, signY - 2, signW + 4, signH + 4, 4)
  ctx.fill()
  // Metallic frame border
  ctx.strokeStyle = '#546E7A'
  ctx.lineWidth = 2.5
  roundRect(ctx, signX - 2, signY - 2, signW + 4, signH + 4, 4)
  ctx.stroke()
  // Neon glow border
  ctx.save()
  ctx.shadowColor = b.glowColor
  ctx.shadowBlur = 20
  ctx.strokeStyle = b.glowColor
  ctx.lineWidth = 2
  roundRect(ctx, signX, signY, signW, signH, 3)
  ctx.stroke()
  ctx.restore()
  // Sign inner fill with gradient
  const sGrad = ctx.createLinearGradient(signX, signY, signX, signY + signH)
  sGrad.addColorStop(0, `rgba(${bRgb.r},${bRgb.g},${bRgb.b},0.05)`)
  sGrad.addColorStop(0.5, `rgba(${hexToRgb(b.glowColor).r},${hexToRgb(b.glowColor).g},${hexToRgb(b.glowColor).b},0.15)`)
  sGrad.addColorStop(1, `rgba(${bRgb.r},${bRgb.g},${bRgb.b},0.05)`)
  ctx.fillStyle = sGrad
  roundRect(ctx, signX, signY, signW, signH, 3)
  ctx.fill()
  // Sign text (GLOWING, CENTERED)
  drawGlowText(ctx, b.name, bx + (b.w / 2) | 0, signY + signH / 2, b.glowColor, '#FFFFFF', 12)
  // Light spill on wall below sign
  const spillGrad = ctx.createLinearGradient(signX, signY + signH, signX, signY + signH + 20)
  spillGrad.addColorStop(0, `rgba(${hexToRgb(b.glowColor).r},${hexToRgb(b.glowColor).g},${hexToRgb(b.glowColor).b},0.06)`)
  spillGrad.addColorStop(1, `rgba(${hexToRgb(b.glowColor).r},${hexToRgb(b.glowColor).g},${hexToRgb(b.glowColor).b},0)`)
  ctx.fillStyle = spillGrad
  ctx.fillRect(signX, signY + signH, signW, 20)
  // Support brackets (metallic)
  for (const bracketX of [signX + 8, signX + signW - 11]) {
    const brkGrad = ctx.createLinearGradient(bracketX, signY + signH, bracketX + 7, signY + signH)
    brkGrad.addColorStop(0, '#546E7A')
    brkGrad.addColorStop(0.5, '#78909C')
    brkGrad.addColorStop(1, '#546E7A')
    ctx.fillStyle = brkGrad
    ctx.fillRect(bracketX, signY + signH, 3, 8)
    ctx.fillRect(bracketX - 2, signY + signH + 6, 9, 3)
  }
}

/* ═══════════════════ NPC Drawing ═══════════════════ */

function drawNPC(ctx: CanvasRenderingContext2D, npc: NPCData, camX: number, camY: number, vw: number, vh: number, charX: number, charY: number, time: number) {
  const nx = (npc.x - camX) | 0
  const ny = (npc.y - camY) | 0
  if (nx < -40 || nx > vw + 40 || ny < -60 || ny > vh + 20) return

  const dist = Math.hypot(npc.x - charX - 10, npc.y - charY - 14)
  const hoverBob = Math.sin(time * 0.006 + npc.x) * 2
  const yOff = npc.type === 'robot' ? hoverBob : 0

  if (npc.type === 'robot') {
    // ── Robot NPC ──
    // Hover shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    ctx.beginPath()
    ctx.ellipse(nx, ny + 4, 8, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Thruster glow
    ctx.fillStyle = `rgba(0,229,255,${(0.18 + Math.sin(time * 0.01) * 0.1).toFixed(2)})`
    ctx.fillRect(nx - 5, ny + yOff, 10, 4)
    ctx.fillStyle = `rgba(0,229,255,${(0.08 + Math.sin(time * 0.01) * 0.05).toFixed(2)})`
    ctx.fillRect(nx - 7, ny + yOff + 2, 14, 3)

    // Body
    ctx.fillStyle = npc.color
    ctx.fillRect(nx - 8, ny - 18 + yOff, 16, 20)
    // Body panel
    ctx.fillStyle = darken(npc.color, 0.65)
    ctx.fillRect(nx - 6, ny - 14 + yOff, 12, 10)
    // Chest light
    const chestBlink = Math.sin(time * 0.008 + npc.x) > 0
    ctx.fillStyle = chestBlink ? '#00FF88' : '#004D40'
    ctx.fillRect(nx - 2, ny - 11 + yOff, 4, 4)
    if (chestBlink) {
      ctx.fillStyle = 'rgba(0,255,136,0.12)'
      ctx.fillRect(nx - 4, ny - 13 + yOff, 8, 8)
    }
    // Body stripe
    ctx.fillStyle = lighten(npc.color, 0.35)
    ctx.fillRect(nx - 8, ny - 6 + yOff, 16, 2)
    // Body highlight
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(nx - 8, ny - 18 + yOff, 3, 18)

    // Arms
    const armBob = Math.sin(time * 0.005) * 2
    ctx.fillStyle = '#78909C'
    ctx.fillRect(nx - 11, ny - 16 + yOff + armBob, 4, 12)
    ctx.fillRect(nx + 7, ny - 16 + yOff - armBob, 4, 12)
    // Hands
    ctx.fillStyle = '#546E7A'
    ctx.fillRect(nx - 11, ny - 5 + yOff + armBob, 4, 3)
    ctx.fillRect(nx + 7, ny - 5 + yOff - armBob, 4, 3)

    // Head
    ctx.fillStyle = '#B0BEC5'
    ctx.fillRect(nx - 7, ny - 28 + yOff, 14, 10)
    // Visor
    ctx.fillStyle = '#263238'
    ctx.fillRect(nx - 6, ny - 26 + yOff, 12, 6)
    // Visor reflection
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fillRect(nx - 5, ny - 25 + yOff, 4, 2)
    // Eyes (glowing)
    const blink = Math.sin(time * 0.005) > 0.92 ? 0 : 1
    ctx.fillStyle = npc.color
    ctx.fillRect(nx - 3, ny - 24 + yOff, 3, 3 * blink)
    ctx.fillRect(nx + 1, ny - 24 + yOff, 3, 3 * blink)
    if (blink) {
      ctx.fillStyle = `${npc.color}35`
      ctx.fillRect(nx - 4, ny - 25 + yOff, 5, 5)
      ctx.fillRect(nx, ny - 25 + yOff, 5, 5)
    }

    // Antenna
    ctx.fillStyle = '#78909C'
    ctx.fillRect(nx - 1, ny - 32 + yOff, 2, 4)
    const antGlow = Math.sin(time * 0.01 + npc.x) > 0
    ctx.fillStyle = antGlow ? '#FF1744' : '#4A0000'
    ctx.fillRect(nx - 2, ny - 34 + yOff, 4, 3)
    if (antGlow) {
      ctx.fillStyle = 'rgba(255,23,68,0.15)'
      ctx.fillRect(nx - 4, ny - 36 + yOff, 8, 6)
    }

    // Ear bolts
    ctx.fillStyle = '#FFD740'
    ctx.fillRect(nx - 8, ny - 24 + yOff, 2, 2)
    ctx.fillRect(nx + 6, ny - 24 + yOff, 2, 2)
  } else {
    // ── Scientist NPC ──
    // Lab coat body
    ctx.fillStyle = '#ECEFF1'
    ctx.fillRect(nx - 8, ny - 18, 16, 22)
    // Coat buttons
    ctx.fillStyle = '#B0BEC5'
    ctx.fillRect(nx - 1, ny - 13, 2, 1)
    ctx.fillRect(nx - 1, ny - 9, 2, 1)
    ctx.fillRect(nx - 1, ny - 5, 2, 1)
    // Coat pocket
    ctx.fillStyle = '#CFD8DC'
    ctx.fillRect(nx + 3, ny - 8, 5, 5)
    // Pen in pocket
    ctx.fillStyle = '#2196F3'
    ctx.fillRect(nx + 5, ny - 12, 2, 5)
    ctx.fillStyle = '#1565C0'
    ctx.fillRect(nx + 5, ny - 12, 2, 2)

    // Arms
    const sArmBob = Math.sin(time * 0.004) * 1
    ctx.fillStyle = '#ECEFF1'
    ctx.fillRect(nx - 11, ny - 16 + sArmBob, 4, 14)
    ctx.fillRect(nx + 7, ny - 16 - sArmBob, 4, 14)
    // Hands
    ctx.fillStyle = '#FFCCBC'
    ctx.fillRect(nx - 11, ny - 3 + sArmBob, 4, 3)
    ctx.fillRect(nx + 7, ny - 3 - sArmBob, 4, 3)

    // Head
    ctx.fillStyle = '#FFCCBC'
    ctx.fillRect(nx - 7, ny - 28, 14, 10)
    // Hair
    ctx.fillStyle = '#5D4037'
    ctx.fillRect(nx - 7, ny - 31, 14, 5)
    ctx.fillRect(nx - 7, ny - 28, 3, 5)
    ctx.fillRect(nx + 4, ny - 28, 3, 5)
    // Eyes
    ctx.fillStyle = '#212121'
    ctx.fillRect(nx - 4, ny - 24, 3, 3)
    ctx.fillRect(nx + 2, ny - 24, 3, 3)
    // Eye whites
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(nx - 3, ny - 24, 1, 1)
    ctx.fillRect(nx + 3, ny - 24, 1, 1)
    // Mouth
    ctx.fillStyle = '#E57373'
    ctx.fillRect(nx - 1, ny - 20, 4, 1)

    // Glasses
    ctx.fillStyle = '#263238'
    ctx.fillRect(nx - 5, ny - 25, 5, 4)
    ctx.fillRect(nx + 1, ny - 25, 5, 4)
    ctx.fillRect(nx - 1, ny - 24, 2, 1)
    // Lens shine
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fillRect(nx - 4, ny - 24, 2, 2)
    ctx.fillRect(nx + 2, ny - 24, 2, 2)
    // Ear pieces
    ctx.fillStyle = '#263238'
    ctx.fillRect(nx - 8, ny - 24, 3, 1)
    ctx.fillRect(nx + 6, ny - 24, 3, 1)

    // Legs
    ctx.fillStyle = '#455A64'
    ctx.fillRect(nx - 5, ny + 4, 4, 7)
    ctx.fillRect(nx + 2, ny + 4, 4, 7)
    // Shoes
    ctx.fillStyle = '#263238'
    ctx.fillRect(nx - 5, ny + 10, 5, 3)
    ctx.fillRect(nx + 2, ny + 10, 5, 3)

    // Clipboard
    ctx.fillStyle = '#8D6E63'
    ctx.fillRect(nx + 9, ny - 14, 6, 10)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(nx + 10, ny - 12, 4, 6)
    // Writing on clipboard
    ctx.fillStyle = '#37474F'
    ctx.fillRect(nx + 11, ny - 11, 2, 1)
    ctx.fillRect(nx + 11, ny - 9, 3, 1)
    ctx.fillRect(nx + 11, ny - 7, 2, 1)
  }

  // ── Guide indicator (arrow pointing to building) ──
  if (npc.buildingId) {
    const building = BUILDINGS.find(b => b.id === npc.buildingId)
    if (building) {
      const buildingCx = building.x + building.w / 2
      const buildingCy = building.y + building.h / 2
      const angle = Math.atan2(buildingCy - npc.y, buildingCx - npc.x)
      const rgb = hexToRgb(npc.color)
      const arrowPulse = (Math.sin(time * 0.06 + npc.x * 0.1) + 1) / 2

      // Arrow pointing toward building (above NPC head)
      const arrowDist = 26
      const arrowX = nx + Math.cos(angle) * arrowDist
      const arrowY = ny - 30 + Math.sin(angle) * 8 + yOff

      // Arrow glow
      ctx.save()
      ctx.shadowColor = npc.color
      ctx.shadowBlur = 6 + arrowPulse * 4
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.6 + arrowPulse * 0.4).toFixed(2)})`
      ctx.beginPath()
      ctx.moveTo(arrowX + Math.cos(angle) * 5, arrowY + Math.sin(angle) * 5)
      ctx.lineTo(arrowX + Math.cos(angle + 2.4) * 4, arrowY + Math.sin(angle + 2.4) * 4)
      ctx.lineTo(arrowX + Math.cos(angle - 2.4) * 4, arrowY + Math.sin(angle - 2.4) * 4)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      // Guide badge (small diamond above head)
      ctx.fillStyle = npc.color
      ctx.beginPath()
      ctx.moveTo(nx, ny - 36 + yOff)
      ctx.lineTo(nx + 3, ny - 32 + yOff)
      ctx.lineTo(nx, ny - 28 + yOff)
      ctx.lineTo(nx - 3, ny - 32 + yOff)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.beginPath()
      ctx.moveTo(nx - 1, ny - 35 + yOff)
      ctx.lineTo(nx + 1, ny - 33 + yOff)
      ctx.lineTo(nx, ny - 30 + yOff)
      ctx.closePath()
      ctx.fill()
    }
  }

  // ── Speech bubble (cloud shape with glow) ──
  if (dist < NPC_DIST) {
    const alpha = Math.min(1, (NPC_DIST - dist) / 30)
    ctx.globalAlpha = alpha
    const text = npc.message
    ctx.font = 'bold 9px monospace'
    const tw = ctx.measureText(text).width
    const bw = tw + 28
    const bh = 26
    const bubX = (nx - bw / 2) | 0
    const bubY = ny - (npc.type === 'robot' ? 72 : 76) + yOff - (npc.buildingId ? 12 : 0)

    // Cloud bubble shape
    ctx.fillStyle = 'rgba(8,12,35,0.95)'
    roundRect(ctx, bubX, bubY, bw, bh, 6)
    ctx.fill()

    // Cloud puffs (top)
    ctx.beginPath()
    ctx.arc(bubX + 10, bubY + 3, 8, 0, Math.PI * 2)
    ctx.arc(bubX + bw / 2, bubY - 2, 9, 0, Math.PI * 2)
    ctx.arc(bubX + bw - 10, bubY + 3, 8, 0, Math.PI * 2)
    ctx.fill()
    // Cloud puffs (bottom)
    ctx.beginPath()
    ctx.arc(bubX + 12, bubY + bh - 3, 6, 0, Math.PI * 2)
    ctx.arc(bubX + bw - 12, bubY + bh - 3, 6, 0, Math.PI * 2)
    ctx.fill()

    // Tail
    ctx.beginPath()
    ctx.moveTo(nx - 5, bubY + bh - 3)
    ctx.lineTo(nx, bubY + bh + 10)
    ctx.lineTo(nx + 5, bubY + bh - 3)
    ctx.closePath()
    ctx.fill()

    // Border glow (BRIGHT)
    ctx.save()
    ctx.shadowColor = npc.color
    ctx.shadowBlur = 10
    ctx.strokeStyle = npc.color
    ctx.lineWidth = 2
    roundRect(ctx, bubX, bubY, bw, bh, 6)
    ctx.stroke()
    ctx.restore()

    // Gradient overlay
    const bubGrad = ctx.createLinearGradient(bubX, bubY, bubX, bubY + bh)
    bubGrad.addColorStop(0, 'rgba(0,229,255,0.1)')
    bubGrad.addColorStop(1, 'rgba(108,99,255,0.06)')
    ctx.fillStyle = bubGrad
    roundRect(ctx, bubX, bubY, bw, bh, 6)
    ctx.fill()

    // Inner border
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    roundRect(ctx, bubX + 2, bubY + 2, bw - 4, bh - 4, 4)
    ctx.stroke()

    // Text with outline (CLEAR, BOLD)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    drawStrokedText(ctx, text, nx, bubY + bh / 2 + 1, 3, 'rgba(0,0,0,0.9)', '#FFFFFF')

    ctx.globalAlpha = 1
  }
}

/* ═══════════════════ Interactive Object Drawing ═══════════════════ */

function drawCrystal(ctx: CanvasRenderingContext2D, crystal: CrystalData, camX: number, camY: number, vw: number, vh: number, time: number) {
  if (crystal.collected) return
  const cx = (crystal.x - camX) | 0
  const cy = (crystal.y - camY) | 0
  if (cx < -20 || cx > vw + 20 || cy < -30 || cy > vh + 20) return

  const floatY = Math.sin(time * 0.04 + crystal.x * 0.1) * 3
  const rgb = hexToRgb(crystal.color)
  const pulse = (Math.sin(time * 0.05 + crystal.y * 0.1) + 1) / 2

  // Ground glow
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.08 + pulse * 0.06).toFixed(3)})`
  ctx.beginPath()
  ctx.ellipse(cx, cy + 10, 12, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  // Crystal diamond shape
  const yOff = floatY
  ctx.fillStyle = crystal.color
  ctx.beginPath()
  ctx.moveTo(cx, cy - 10 + yOff)
  ctx.lineTo(cx + 6, cy + yOff)
  ctx.lineTo(cx, cy + 8 + yOff)
  ctx.lineTo(cx - 6, cy + yOff)
  ctx.closePath()
  ctx.fill()

  // Crystal highlight
  ctx.fillStyle = `rgba(255,255,255,${(0.3 + pulse * 0.2).toFixed(2)})`
  ctx.beginPath()
  ctx.moveTo(cx - 1, cy - 8 + yOff)
  ctx.lineTo(cx + 3, cy - 1 + yOff)
  ctx.lineTo(cx, cy + 1 + yOff)
  ctx.lineTo(cx - 3, cy - 2 + yOff)
  ctx.closePath()
  ctx.fill()

  // Crystal inner glow
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.3 + pulse * 0.3).toFixed(2)})`
  ctx.fillRect(cx - 2, cy - 4 + yOff, 4, 6)

  // Outer glow ring
  ctx.save()
  ctx.shadowColor = crystal.color
  ctx.shadowBlur = 12 + pulse * 6
  ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.25 + pulse * 0.2).toFixed(2)})`
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(cx, cy + yOff, 10, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  // Sparkle particles
  if (time % 20 < 10) {
    ctx.fillStyle = `rgba(255,255,255,${(0.5 + pulse * 0.3).toFixed(2)})`
    ctx.fillRect(cx + 4, cy - 6 + yOff, 1, 1)
    ctx.fillRect(cx - 5, cy + 3 + yOff, 1, 1)
  }

  // Label
  ctx.font = 'bold 6px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.6 + pulse * 0.3).toFixed(2)})`
  ctx.fillText(crystal.label, cx, cy - 13 + yOff)
}

function drawBoostPad(ctx: CanvasRenderingContext2D, pad: BoostPadData, camX: number, camY: number, vw: number, vh: number, time: number) {
  const px = (pad.x - camX) | 0
  const py = (pad.y - camY) | 0
  if (px < -24 || px > vw + 24 || py < -24 || py > vh + 24) return

  const rgb = hexToRgb(pad.color)
  const pulse = (Math.sin(time * 0.06) + 1) / 2

  // Ground glow (larger, brighter)
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.1 + pulse * 0.08).toFixed(3)})`
  ctx.beginPath()
  ctx.ellipse(px, py + 2, 22, 10, 0, 0, Math.PI * 2)
  ctx.fill()

  // Base platform (brighter)
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.15)`
  ctx.beginPath()
  ctx.ellipse(px, py, 18, 9, 0, 0, Math.PI * 2)
  ctx.fill()

  // Active ring (thicker, brighter)
  ctx.save()
  ctx.shadowColor = pad.color
  ctx.shadowBlur = 12 + pulse * 10
  ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.6 + pulse * 0.4).toFixed(2)})`
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(px, py, 15, 7, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  // Inner ring
  ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.3 + pulse * 0.2).toFixed(2)})`
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.ellipse(px, py, 8, 4, 0, 0, Math.PI * 2)
  ctx.stroke()

  // Center dot
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.5 + pulse * 0.4).toFixed(2)})`
  ctx.beginPath()
  ctx.arc(px, py, 2, 0, Math.PI * 2)
  ctx.fill()

  // Arrow up indicator (bigger)
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.7 + pulse * 0.3).toFixed(2)})`
  ctx.beginPath()
  ctx.moveTo(px, py - 8 - pulse * 4)
  ctx.lineTo(px + 4, py - 2 - pulse * 4)
  ctx.lineTo(px - 4, py - 2 - pulse * 4)
  ctx.closePath()
  ctx.fill()

  // Speed lines (brighter)
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.3 + pulse * 0.2).toFixed(2)})`
  ctx.fillRect(px - 10, py - 3 - pulse * 3, 5, 1.5)
  ctx.fillRect(px + 6, py - 3 - pulse * 3, 5, 1.5)

  // Label
  ctx.font = 'bold 6px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.6 + pulse * 0.3).toFixed(2)})`
  ctx.fillText('BOOST', px, py - 12 - pulse * 4)
}

function drawTeleporter(ctx: CanvasRenderingContext2D, tp: TeleporterData, camX: number, camY: number, vw: number, vh: number, time: number, isCoolingDown: boolean) {
  const tx = (tp.x - camX) | 0
  const ty = (tp.y - camY) | 0
  if (tx < -30 || tx > vw + 30 || ty < -40 || ty > vh + 24) return

  const rgb = hexToRgb(tp.color)
  const pulse = (Math.sin(time * 0.04 + tp.x * 0.1) + 1) / 2
  const alpha = isCoolingDown ? 0.3 : (0.5 + pulse * 0.4)

  // Ground glow (large, prominent)
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${isCoolingDown ? 0.03 : (0.08 + pulse * 0.06).toFixed(3)})`
  ctx.beginPath()
  ctx.ellipse(tx, ty + 6, 28, 12, 0, 0, Math.PI * 2)
  ctx.fill()

  // Portal base (brighter)
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.12)`
  ctx.beginPath()
  ctx.ellipse(tx, ty + 4, 20, 10, 0, 0, Math.PI * 2)
  ctx.fill()

  // Outer ring (thicker, brighter)
  ctx.save()
  ctx.shadowColor = tp.color
  ctx.shadowBlur = isCoolingDown ? 6 : 16 + pulse * 12
  ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha.toFixed(2)})`
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(tx, ty + 2, 18, 10, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  // Inner vortex (faster spin)
  if (!isCoolingDown) {
    const spinAngle = time * 0.1
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.2 + pulse * 0.15).toFixed(2)})`
    ctx.beginPath()
    ctx.ellipse(tx, ty + 2, 12, 6, spinAngle, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.12 + pulse * 0.08).toFixed(2)})`
    ctx.beginPath()
    ctx.ellipse(tx, ty + 2, 6, 3, -spinAngle, 0, Math.PI * 2)
    ctx.fill()
    // Center bright dot
    ctx.fillStyle = `rgba(255,255,255,${(0.3 + pulse * 0.3).toFixed(2)})`
    ctx.beginPath()
    ctx.arc(tx, ty + 2, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // Vertical beam (taller, brighter)
  if (!isCoolingDown) {
    const beamGrad = ctx.createLinearGradient(tx, ty - 40, tx, ty + 4)
    beamGrad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`)
    beamGrad.addColorStop(0.3, `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.04 + pulse * 0.03).toFixed(3)})`)
    beamGrad.addColorStop(0.7, `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.12 + pulse * 0.08).toFixed(3)})`)
    beamGrad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.2 + pulse * 0.1).toFixed(3)})`)
    ctx.fillStyle = beamGrad
    ctx.fillRect(tx - 5, ty - 40, 10, 44)
    // Beam particles
    if (time % 4 < 2) {
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.4 + pulse * 0.3).toFixed(2)})`
      const beamParticleY = ty - 30 + (time % 30)
      ctx.fillRect(tx - 1, beamParticleY, 2, 2)
      ctx.fillRect(tx + 2, beamParticleY - 10, 1, 1)
    }
  }

  // Label (more prominent)
  ctx.font = 'bold 7px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(0.7 + pulse * 0.3).toFixed(2)})`
  ctx.fillText(isCoolingDown ? 'COOLDOWN' : 'WARP', tx, ty - 16)
  // Direction hint
  if (!isCoolingDown) {
    ctx.font = 'bold 5px monospace'
    ctx.fillStyle = `rgba(255,255,255,${(0.3 + pulse * 0.2).toFixed(2)})`
    const targetLabel = tp.id === 'tp1' ? '→ S.EAST' : '→ N.WEST'
    ctx.fillText(targetLabel, tx, ty - 8)
  }
}

function drawScoreUI(ctx: CanvasRenderingContext2D, vw: number, vh: number, score: number, totalCrystals: number, hasSpeedBoost: boolean, time: number) {
  const uiX = 12
  const uiY = vh - 40

  // Background
  ctx.fillStyle = 'rgba(0,0,0,0.65)'
  roundRect(ctx, uiX - 4, uiY - 4, 130, 32, 5)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,229,255,0.3)'
  ctx.lineWidth = 1
  roundRect(ctx, uiX - 4, uiY - 4, 130, 32, 5)
  ctx.stroke()

  // Crystal icon
  ctx.fillStyle = '#00E5FF'
  ctx.beginPath()
  ctx.moveTo(uiX + 8, uiY + 2)
  ctx.lineTo(uiX + 14, uiY + 10)
  ctx.lineTo(uiX + 8, uiY + 18)
  ctx.lineTo(uiX + 2, uiY + 10)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.beginPath()
  ctx.moveTo(uiX + 7, uiY + 4)
  ctx.lineTo(uiX + 11, uiY + 9)
  ctx.lineTo(uiX + 8, uiY + 12)
  ctx.lineTo(uiX + 5, uiY + 8)
  ctx.closePath()
  ctx.fill()

  // Score text
  ctx.font = 'bold 10px monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(`${score}/${totalCrystals}`, uiX + 22, uiY + 11)

  // Speed boost indicator
  if (hasSpeedBoost) {
    const boostPulse = (Math.sin(time * 0.1) + 1) / 2
    ctx.fillStyle = `rgba(0,229,255,${(0.5 + boostPulse * 0.5).toFixed(2)})`
    ctx.font = 'bold 8px monospace'
    ctx.fillText('⚡ BOOST', uiX + 70, uiY + 11)
  }

  // All collected message
  if (score >= totalCrystals) {
    const glow = (Math.sin(time * 0.05) + 1) / 2
    ctx.font = 'bold 8px monospace'
    ctx.textAlign = 'left'
    ctx.fillStyle = `rgba(105,240,174,${(0.7 + glow * 0.3).toFixed(2)})`
    ctx.fillText('ALL FOUND!', uiX + 70, uiY + 11)
  }
}

/* ═══════════════════ Character Drawing ═══════════════════ */

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  dir: string,
  walkCycle: number,
  isMoving: boolean,
  idleBob: number,
  time: number
) {
  const idleBobY = isMoving ? 0 : Math.sin(idleBob * 0.06) * 1.5
  // Smooth walk bob - slight vertical oscillation
  const walkBobY = isMoving ? Math.abs(Math.sin(walkCycle)) * -1.5 : 0
  const totalBob = idleBobY + walkBobY

  ctx.save()
  ctx.translate((screenX) | 0, (screenY + totalBob) | 0)

  // Shadow (stretches slightly when walking)
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.beginPath()
  const shadowScale = isMoving ? 1.1 : 1
  ctx.ellipse(10, 28, 10 * shadowScale, 3, 0, 0, Math.PI * 2)
  ctx.fill()

  // Walk phase (0 to 2PI cycle)
  const phase = walkCycle
  const legSwing = isMoving ? Math.sin(phase) * 4 : 0  // How far forward/back each leg goes
  const armSwingSmooth = isMoving ? Math.sin(phase) * 3 : 0  // Smooth arm swing
  const bodyTilt = isMoving ? Math.sin(phase) * 0.3 : 0  // Very subtle body tilt

  // ── Back arm (behind body) ──
  const backArmX = dir === 'left' ? 18 : -2
  ctx.fillStyle = '#00838F'
  const backArmSwing = -armSwingSmooth
  ctx.fillRect(backArmX, 12 + backArmSwing, 4, 9)
  // Back hand
  ctx.fillStyle = '#FFCC80'
  ctx.fillRect(backArmX, 20 + backArmSwing, 4, 3)

  // ── Back leg ──
  const backLegSwing = -legSwing
  ctx.fillStyle = '#004D40'
  // Upper leg
  ctx.fillRect(11 + backLegSwing * 0.3, 19, 5, 6)
  // Lower leg (bends at knee)
  ctx.fillRect(11 + backLegSwing * 0.6, 24, 5, 6)
  // Back shoe
  ctx.fillStyle = '#00251a'
  const backShoeX = 11 + backLegSwing * 0.6
  ctx.fillRect(backShoeX - 1, 29, 6, 2)

  // ── Body ──
  ctx.fillStyle = '#00E5FF'
  ctx.fillRect(2, 10, 16, 10)
  // Body stripe (horizontal accent)
  ctx.fillStyle = '#00BCD4'
  ctx.fillRect(2, 14, 16, 2)
  // Body top highlight
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.fillRect(2, 10, 16, 1)
  // Chest pocket
  ctx.fillStyle = '#00838F'
  ctx.fillRect(5, 11, 5, 3)
  ctx.fillStyle = '#006064'
  ctx.fillRect(5, 13, 5, 1)
  // Belt
  ctx.fillStyle = '#004D40'
  ctx.fillRect(2, 18, 16, 2)
  // Belt buckle
  ctx.fillStyle = '#FFD740'
  ctx.fillRect(8, 18, 4, 2)
  // Collar
  ctx.fillStyle = '#006064'
  ctx.fillRect(5, 10, 10, 1)

  // ── Front leg ──
  const frontLegSwing = legSwing
  ctx.fillStyle = '#006064'
  // Upper leg
  ctx.fillRect(4 + frontLegSwing * 0.3, 19, 5, 6)
  // Lower leg
  ctx.fillRect(4 + frontLegSwing * 0.6, 24, 5, 6)
  // Front shoe
  ctx.fillStyle = '#004D40'
  const frontShoeX = 4 + frontLegSwing * 0.6
  ctx.fillRect(frontShoeX - 1, 29, 6, 2)
  // Shoe sole
  ctx.fillStyle = '#00251a'
  ctx.fillRect(frontShoeX - 1, 30, 6, 1)

  // ── Front arm (in front of body) ──
  const frontArmX = dir === 'left' ? -2 : 18
  ctx.fillStyle = '#00BCD4'
  ctx.fillRect(frontArmX, 12 + armSwingSmooth, 4, 9)
  // Front hand
  ctx.fillStyle = '#FFE0B2'
  ctx.fillRect(frontArmX, 20 + armSwingSmooth, 4, 3)

  // ── Head ──
  // Slight head bob in walk direction
  const headOffX = isMoving ? Math.sin(phase + 0.5) * 0.5 : 0
  ctx.fillStyle = '#FFE0B2'
  ctx.fillRect(3 + headOffX, 0, 14, 10)

  // Hair
  ctx.fillStyle = '#4E342E'
  ctx.fillRect(3 + headOffX, -1, 14, 5)
  if (dir === 'left') ctx.fillRect(3 + headOffX, -1, 3, 7)
  else if (dir === 'right') ctx.fillRect(14 + headOffX, -1, 3, 7)
  else { ctx.fillRect(3 + headOffX, -1, 3, 6); ctx.fillRect(14 + headOffX, -1, 3, 6) }

  // Eyes
  ctx.fillStyle = '#212121'
  if (dir === 'down') {
    ctx.fillRect(6 + headOffX, 5, 3, 3)
    ctx.fillRect(11 + headOffX, 5, 3, 3)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(7 + headOffX, 5, 1, 1)
    ctx.fillRect(12 + headOffX, 5, 1, 1)
    ctx.fillStyle = '#E57373'
    ctx.fillRect(8 + headOffX, 8, 4, 1)
  } else if (dir === 'up') {
    ctx.fillStyle = '#4E342E'
    ctx.fillRect(3 + headOffX, 2, 14, 3)
  } else if (dir === 'left') {
    ctx.fillRect(5 + headOffX, 5, 3, 3)
    ctx.fillRect(9 + headOffX, 5, 3, 3)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(5 + headOffX, 5, 1, 1)
    ctx.fillRect(9 + headOffX, 5, 1, 1)
    ctx.fillStyle = '#E57373'
    ctx.fillRect(6 + headOffX, 8, 3, 1)
  } else {
    ctx.fillRect(8 + headOffX, 5, 3, 3)
    ctx.fillRect(12 + headOffX, 5, 3, 3)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(8 + headOffX, 5, 1, 1)
    ctx.fillRect(12 + headOffX, 5, 1, 1)
    ctx.fillStyle = '#E57373'
    ctx.fillRect(11 + headOffX, 8, 3, 1)
  }

  ctx.restore()
}

/* ═══════════════════ UI Drawing ═══════════════════ */

function drawMinimap(ctx: CanvasRenderingContext2D, vw: number, vh: number, charX: number, charY: number, camX: number, camY: number, time: number) {
  const mw = 120
  const mh = 90
  const mx = vw - mw - 12
  const my = 12
  const sx = mw / WORLD_W
  const sy = mh / WORLD_H

  // Background
  ctx.fillStyle = 'rgba(0,0,0,0.65)'
  roundRect(ctx, mx - 3, my - 3, mw + 6, mh + 6, 4)
  ctx.fill()
  ctx.fillStyle = 'rgba(13,18,51,0.92)'
  ctx.fillRect(mx, my, mw, mh)

  // Grid lines
  ctx.strokeStyle = 'rgba(0,229,255,0.06)'
  ctx.lineWidth = 0.3
  for (let gx = mx; gx < mx + mw; gx += 12) {
    ctx.beginPath(); ctx.moveTo(gx, my); ctx.lineTo(gx, my + mh); ctx.stroke()
  }
  for (let gy = my; gy < my + mh; gy += 12) {
    ctx.beginPath(); ctx.moveTo(mx, gy); ctx.lineTo(mx + mw, gy); ctx.stroke()
  }

  // Paths
  ctx.fillStyle = 'rgba(44,44,84,0.7)'
  for (const p of PATHS) {
    ctx.fillRect(mx + p.x * sx, my + p.y * sy, Math.max(p.w * sx, 1), Math.max(p.h * sy, 1))
  }

  // Buildings
  for (const b of BUILDINGS) {
    ctx.fillStyle = b.glowColor
    ctx.fillRect(mx + b.x * sx, my + b.y * sy, Math.max(b.w * sx, 4), Math.max(b.h * sy, 3))
  }

  // Crystals on minimap
  for (const crystal of CRYSTALS) {
    if (crystal.collected) continue
    const cPulse = (Math.sin(time * 0.05) + 1) / 2
    ctx.fillStyle = `rgba(${hexToRgb(crystal.color).r},${hexToRgb(crystal.color).g},${hexToRgb(crystal.color).b},${(0.5 + cPulse * 0.5).toFixed(2)})`
    ctx.fillRect(mx + crystal.x * sx - 1, my + crystal.y * sy - 1, 3, 3)
  }

  // Teleporters on minimap
  for (const tp of TELEPORTERS) {
    ctx.fillStyle = tp.color
    ctx.fillRect(mx + tp.x * sx - 1, my + tp.y * sy - 1, 4, 4)
  }

  // Viewport rect
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(mx + camX * sx, my + camY * sy, vw * sx, vh * sy)

  // Character dot with glow
  ctx.fillStyle = 'rgba(0,229,255,0.35)'
  ctx.fillRect(mx + charX * sx - 2, my + charY * sy - 2, 6, 6)
  ctx.fillStyle = '#00E5FF'
  ctx.fillRect(mx + charX * sx - 1, my + charY * sy - 1, 4, 4)

  // Border
  ctx.strokeStyle = 'rgba(0,229,255,0.3)'
  ctx.lineWidth = 1
  roundRect(ctx, mx - 3, my - 3, mw + 6, mh + 6, 4)
  ctx.stroke()

  // Label
  ctx.fillStyle = 'rgba(0,229,255,0.5)'
  ctx.font = '5px monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('MAP', mx + 3, my + 3)
}

function drawPrompt(ctx: CanvasRenderingContext2D, building: BuildingData | null, camX: number, camY: number, isMobile: boolean, time: number) {
  if (!building) return

  const bx = (building.x + building.w / 2 - camX) | 0
  const by = (building.y + building.h + 20 - camY) | 0
  const text = isMobile ? 'Tap [E] to enter' : 'Press E to enter'

  ctx.font = 'bold 8px monospace'
  const tw = ctx.measureText(text).width
  const pw = tw + 18
  const ph = 18

  const alpha = 0.7 + Math.sin(time * 0.006) * 0.3
  ctx.globalAlpha = alpha

  // Background pill
  ctx.fillStyle = 'rgba(0,0,0,0.82)'
  roundRect(ctx, bx - pw / 2, by, pw, ph, 5)
  ctx.fill()

  // Border with glow
  ctx.save()
  ctx.shadowColor = building.glowColor
  ctx.shadowBlur = 6
  ctx.strokeStyle = building.glowColor
  ctx.lineWidth = 1.5
  roundRect(ctx, bx - pw / 2, by, pw, ph, 5)
  ctx.stroke()
  ctx.restore()

  // Gradient fill
  const pGrad = ctx.createLinearGradient(bx - pw / 2, by, bx - pw / 2, by + ph)
  pGrad.addColorStop(0, 'rgba(0,229,255,0.1)')
  pGrad.addColorStop(1, 'rgba(108,99,255,0.06)')
  ctx.fillStyle = pGrad
  roundRect(ctx, bx - pw / 2, by, pw, ph, 5)
  ctx.fill()

  // Text
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  drawStrokedText(ctx, text, bx, by + ph / 2, 2, 'rgba(0,0,0,0.85)', building.glowColor)

  ctx.globalAlpha = 1
}

/* ═══════════════════ Component ═══════════════════ */

export default function PixelWorld({ onBuildingClick }: PixelWorldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const animRef = useRef(0)
  const timeRef = useRef(0)

  const stateRef = useRef({
    charX: WORLD_W / 2 - 10,
    charY: WORLD_H / 2 - 14,
    dir: 'down' as 'left' | 'right' | 'up' | 'down',
    walkCycle: 0,
    isMoving: false,
    camX: 0,
    camY: 0,
    nearBuilding: null as string | null,
    idleBob: 0,
    targetX: -1,
    targetY: -1,
    score: 0,
    speedBoost: 0,
    teleportCooldown: 0,
  })

  const keysRef = useRef(new Set<string>())
  const joystickRef = useRef({ active: false, dx: 0, dy: 0 })
  const thumbRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])

  const [isMobile, setIsMobile] = useState(false)
  const [nearBuilding, setNearBuilding] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(true)

  useEffect(() => {
    const check = () => setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
    check()
    const onResize = () => check()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setShowHelp(false), 6000)
    return () => clearTimeout(t)
  }, [])

  const findNearBuilding = useCallback((cx: number, cy: number): BuildingData | null => {
    let nearest: BuildingData | null = null
    let minDist = INTERACT_DIST
    for (const b of BUILDINGS) {
      const d = Math.hypot(cx - (b.x + b.w / 2), cy - (b.y + b.h / 2))
      if (d < minDist) { minDist = d; nearest = b }
    }
    return nearest
  }, [])

  const interact = useCallback(() => {
    const s = stateRef.current
    const b = findNearBuilding(s.charX + 10, s.charY + 14)
    if (b) onBuildingClick(b.id)
  }, [onBuildingClick, findNearBuilding])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      keysRef.current.add(k)
      if (k === 'e' || k === 'enter') interact()
    }
    const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase())
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp) }
  }, [interact])

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const s = stateRef.current
    const offscreen = offscreenRef.current
    if (!offscreen) return
    const scaleX = offscreen.width / rect.width
    const scaleY = offscreen.height / rect.height
    s.targetX = (e.clientX - rect.left) * scaleX + s.camX
    s.targetY = (e.clientY - rect.top) * scaleY + s.camY
  }, [])

  const handleCanvasTouch = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.changedTouches[0]
    if (touch.clientY > rect.bottom - 130) return
    const s = stateRef.current
    const offscreen = offscreenRef.current
    if (!offscreen) return
    const scaleX = offscreen.width / rect.width
    const scaleY = offscreen.height / rect.height
    s.targetX = (touch.clientX - rect.left) * scaleX + s.camX
    s.targetY = (touch.clientY - rect.top) * scaleY + s.camY
  }, [])

  const handleJoyStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation()
    joystickRef.current.active = true
    joystickRef.current.dx = 0; joystickRef.current.dy = 0
    stateRef.current.targetX = -1; stateRef.current.targetY = -1
    if (thumbRef.current) thumbRef.current.style.transform = 'translate(0px, 0px)'
  }, [])

  const handleJoyMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!joystickRef.current.active) return
    const touch = e.touches[0]
    const base = document.getElementById('joystick-base')
    if (!base) return
    const rect = base.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = touch.clientX - cx
    let dy = touch.clientY - cy
    const maxR = rect.width / 2 - 20
    const dist = Math.hypot(dx, dy)
    if (dist > maxR) { dx = dx / dist * maxR; dy = dy / dist * maxR }
    joystickRef.current.dx = dx / maxR
    joystickRef.current.dy = dy / maxR
    if (thumbRef.current) thumbRef.current.style.transform = `translate(${dx}px, ${dy}px)`
  }, [])

  const handleJoyEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    joystickRef.current.active = false
    joystickRef.current.dx = 0; joystickRef.current.dy = 0
    if (thumbRef.current) thumbRef.current.style.transform = 'translate(0px, 0px)'
  }, [])

  // ── Main Game Loop Effect ──
  useEffect(() => {
    const offscreen = document.createElement('canvas')
    offscreenRef.current = offscreen

    const resize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return
      const cw = container.clientWidth
      const ch = container.clientHeight
      canvas.width = cw
      canvas.height = ch
      offscreen.width = Math.ceil(cw / PIXEL_SCALE)
      offscreen.height = Math.ceil(ch / PIXEL_SCALE)
    }
    resize()
    window.addEventListener('resize', resize)

    const loop = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      const offCtx = offscreen?.getContext('2d')
      if (!canvas || !ctx || !offCtx) { animRef.current = requestAnimationFrame(loop); return }

      const s = stateRef.current
      const keys = keysRef.current
      const joy = joystickRef.current
      timeRef.current++
      const time = timeRef.current
      const vw = offscreen.width
      const vh = offscreen.height

      // ── Input Processing ──
      let dx = 0, dy = 0
      if (keys.has('arrowleft') || keys.has('a')) dx -= 1
      if (keys.has('arrowright') || keys.has('d')) dx += 1
      if (keys.has('arrowup') || keys.has('w')) dy -= 1
      if (keys.has('arrowdown') || keys.has('s')) dy += 1

      if (joy.active && (Math.abs(joy.dx) > 0.15 || Math.abs(joy.dy) > 0.15)) {
        dx += joy.dx
        dy += joy.dy
      }

      if (s.targetX >= 0 && s.targetY >= 0 && !joy.active && dx === 0 && dy === 0) {
        const tdx = s.targetX - (s.charX + 10)
        const tdy = s.targetY - (s.charY + 14)
        const tdist = Math.hypot(tdx, tdy)
        if (tdist > CHAR_SPEED + 1) {
          dx += tdx / tdist
          dy += tdy / tdist
        } else {
          s.targetX = -1; s.targetY = -1
        }
      } else if (dx !== 0 || dy !== 0) {
        s.targetX = -1; s.targetY = -1
      }

      const len = Math.hypot(dx, dy)
      if (len > 0.01) {
        const speed = s.speedBoost > 0 ? CHAR_SPEED * 1.8 : CHAR_SPEED
        dx = dx / len * speed
        dy = dy / len * speed
        s.isMoving = true

        if (Math.abs(dx) > Math.abs(dy)) s.dir = dx > 0 ? 'right' : 'left'
        else s.dir = dy > 0 ? 'down' : 'up'

        s.walkCycle += 0.18  // Smooth continuous walk cycle

        if (time % 8 === 0) {
          particlesRef.current.push({
            x: s.charX + 10 + (Math.random() - 0.5) * 8,
            y: s.charY + 28,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -Math.random() * 0.4 - 0.1,
            life: 22, maxLife: 22,
            color: s.speedBoost > 0 ? '#00E5FF' : '#4a4a6a', size: 2,
          })
        }
      } else {
        s.isMoving = false
        // Gradually slow down walk cycle
        if (s.walkCycle % (Math.PI * 2) > 0.1) s.walkCycle += 0.05
        s.idleBob++
      }

      // Decrease speed boost
      if (s.speedBoost > 0) s.speedBoost--
      // Decrease teleport cooldown
      if (s.teleportCooldown > 0) s.teleportCooldown--

      s.charX = Math.max(0, Math.min(WORLD_W - 20, s.charX + dx))
      s.charY = Math.max(0, Math.min(WORLD_H - 31, s.charY + dy))

      // ── Crystal collection ──
      const charCX = s.charX + 10
      const charCY = s.charY + 14
      for (const crystal of CRYSTALS) {
        if (crystal.collected) continue
        const dist = Math.hypot(charCX - crystal.x, charCY - crystal.y)
        if (dist < 20) {
          crystal.collected = true
          s.score++
          // Burst particles on collection
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2
            particlesRef.current.push({
              x: crystal.x,
              y: crystal.y,
              vx: Math.cos(angle) * 1.5,
              vy: Math.sin(angle) * 1.5,
              life: 30, maxLife: 30,
              color: crystal.color, size: 3,
            })
          }
        }
      }

      // ── Boost pad activation ──
      for (const pad of BOOST_PADS) {
        const dist = Math.hypot(charCX - pad.x, charCY - pad.y)
        if (dist < 18 && s.speedBoost <= 0) {
          s.speedBoost = 120  // 2 seconds of boost
          // Speed particles
          for (let i = 0; i < 8; i++) {
            particlesRef.current.push({
              x: pad.x + (Math.random() - 0.5) * 10,
              y: pad.y + (Math.random() - 0.5) * 6,
              vx: (Math.random() - 0.5) * 2,
              vy: -Math.random() * 2 - 0.5,
              life: 25, maxLife: 25,
              color: pad.color, size: 2,
            })
          }
        }
      }

      // ── Teleporter activation ──
      if (s.teleportCooldown <= 0) {
        for (const tp of TELEPORTERS) {
          const dist = Math.hypot(charCX - tp.x, charCY - tp.y)
          if (dist < 20) {
            const target = TELEPORTERS.find(t => t.id === tp.targetId)
            if (target) {
              s.charX = target.x - 10
              s.charY = target.y - 14
              s.teleportCooldown = 90  // 1.5 second cooldown
              // Teleport particles at source
              for (let i = 0; i < 15; i++) {
                const angle = (i / 15) * Math.PI * 2
                particlesRef.current.push({
                  x: tp.x,
                  y: tp.y,
                  vx: Math.cos(angle) * 2,
                  vy: Math.sin(angle) * 2,
                  life: 35, maxLife: 35,
                  color: tp.color, size: 3,
                })
              }
              // Teleport particles at destination
              for (let i = 0; i < 15; i++) {
                const angle = (i / 15) * Math.PI * 2
                particlesRef.current.push({
                  x: target.x,
                  y: target.y,
                  vx: Math.cos(angle) * 2,
                  vy: Math.sin(angle) * 2,
                  life: 35, maxLife: 35,
                  color: target.color, size: 3,
                })
              }
            }
            break
          }
        }
      }

      const targetCamX = s.charX + 10 - vw / 2
      const targetCamY = s.charY + 14 - vh / 2
      const clampedX = Math.max(0, Math.min(WORLD_W - vw, targetCamX))
      const clampedY = Math.max(0, Math.min(WORLD_H - vh, targetCamY))
      s.camX += (clampedX - s.camX) * CAM_LERP
      s.camY += (clampedY - s.camY) * CAM_LERP

      const nearB = findNearBuilding(s.charX + 10, s.charY + 14)
      const newNear = nearB?.id ?? null
      if (newNear !== s.nearBuilding) {
        s.nearBuilding = newNear
        setNearBuilding(newNear)
      }

      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life--
        return p.life > 0
      })

      // ── Render ──
      offCtx.imageSmoothingEnabled = false
      const camX = s.camX
      const camY = s.camY

      drawBackground(offCtx, vw, vh, camX, camY, time)
      drawGround(offCtx, vw, vh, camX, camY)
      drawFlowers(offCtx, vw, vh, camX, camY)

      for (const tree of TREES) drawTree(offCtx, tree, camX, camY, vw, vh)
      for (const lamp of LAMPS) drawLamp(offCtx, lamp, camX, camY, vw, vh, time)
      drawCenterMonument(offCtx, camX, camY, vw, vh, time)

      // Draw interactive objects (ground level, before entities)
      for (const pad of BOOST_PADS) drawBoostPad(offCtx, pad, camX, camY, vw, vh, time)
      for (const tp of TELEPORTERS) drawTeleporter(offCtx, tp, camX, camY, vw, vh, time, s.teleportCooldown > 0)
      for (const crystal of CRYSTALS) drawCrystal(offCtx, crystal, camX, camY, vw, vh, time)

      const entities: { y: number; draw: () => void }[] = []

      for (const b of BUILDINGS) {
        const bRef = b
        entities.push({ y: b.y + b.h, draw: () => drawBuilding(offCtx, bRef, camX, camY, vw, vh, time, s.charX, s.charY) })
      }

      for (const npc of NPCS) {
        const nRef = npc
        entities.push({ y: npc.y + (npc.type === 'robot' ? 0 : 6), draw: () => drawNPC(offCtx, nRef, camX, camY, vw, vh, s.charX, s.charY, time) })
      }

      entities.push({
        y: s.charY + 31,
        draw: () => drawCharacter(offCtx, s.charX - camX, s.charY - camY, s.dir, s.walkCycle, s.isMoving, s.idleBob, time),
      })

      entities.sort((a, b) => a.y - b.y)
      for (const e of entities) e.draw()

      // Particles
      for (const p of particlesRef.current) {
        const px = (p.x - camX) | 0
        const py = (p.y - camY) | 0
        offCtx.globalAlpha = p.life / p.maxLife * 0.6
        offCtx.fillStyle = p.color
        offCtx.fillRect(px, py, p.size, p.size)
      }
      offCtx.globalAlpha = 1

      // UI
      drawPrompt(offCtx, nearB, camX, camY, isMobile, time)
      drawMinimap(offCtx, vw, vh, s.charX, s.charY, camX, camY, time)
      drawScoreUI(offCtx, vw, vh, s.score, CRYSTALS.length, s.speedBoost > 0, time)

      // ── Blit to display ──
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height)

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [isMobile, findNearBuilding])

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#030712]" style={{ minHeight: '300px' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair"
        style={{ imageRendering: 'pixelated' }}
        onClick={handleCanvasClick}
        onTouchEnd={handleCanvasTouch}
      />

      {isMobile && (
        <div
          className="absolute bottom-6 left-6 touch-none select-none"
          onTouchStart={handleJoyStart}
          onTouchMove={handleJoyMove}
          onTouchEnd={handleJoyEnd}
        >
          <div
            id="joystick-base"
            className="w-28 h-28 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center backdrop-blur-sm"
          >
            <div
              ref={thumbRef}
              className="w-12 h-12 rounded-full bg-white/30 border-2 border-white/40"
              style={{ transition: 'transform 0.05s ease-out' }}
            />
          </div>
        </div>
      )}

      {isMobile && (
        <button
          className={`absolute bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all duration-200 touch-none select-none ${
            nearBuilding
              ? 'bg-white/25 border-2 border-white/60 scale-110 shadow-lg shadow-white/20'
              : 'bg-white/10 border border-white/20 scale-100 opacity-40'
          }`}
          onTouchStart={(e) => { e.preventDefault(); interact() }}
          aria-label="Interact with building"
        >
          E
        </button>
      )}

      {showHelp && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white/80 px-5 py-2 rounded-lg text-xs font-mono pointer-events-none backdrop-blur-sm border border-white/10 animate-pulse">
          {isMobile
            ? 'Tap to move \u2022 Collect crystals \u2022 Joystick + E near buildings'
            : 'WASD / Arrows to move \u2022 E to enter buildings \u2022 Collect crystals & use portals!'}
        </div>
      )}
    </div>
  )
}
