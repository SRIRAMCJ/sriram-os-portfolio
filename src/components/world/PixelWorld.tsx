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
}

interface NPCData {
  id: string
  x: number
  y: number
  type: 'robot' | 'scientist'
  message: string
  color: string
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

const WORLD_W = 2000
const WORLD_H = 1500
const PIXEL_SCALE = 4
const CHAR_SPEED = 3
const INTERACT_DIST = 55
const NPC_DIST = 65
const CAM_LERP = 0.08

/* ═══════════════════ Game Data ═══════════════════ */

const BUILDINGS: BuildingData[] = [
  { id: 'ai-lab', name: 'AI Lab', color: '#00838F', glowColor: '#00E5FF', x: 160, y: 80, w: 150, h: 110 },
  { id: 'projects', name: 'Projects Hub', color: '#6A1B9A', glowColor: '#E040FB', x: 730, y: 80, w: 160, h: 110 },
  { id: 'experience', name: 'Experience', color: '#AD1457', glowColor: '#FF4081', x: 1300, y: 80, w: 150, h: 110 },
  { id: 'skills', name: 'Skills Academy', color: '#2E7D32', glowColor: '#69F0AE', x: 160, y: 870, w: 150, h: 110 },
  { id: 'research', name: 'Research Center', color: '#F57F17', glowColor: '#FFD740', x: 730, y: 870, w: 160, h: 110 },
  { id: 'contact', name: 'Contact', color: '#E65100', glowColor: '#FFAB40', x: 1300, y: 870, w: 150, h: 110 },
]

const NPCS: NPCData[] = [
  { id: 'r1', x: 420, y: 280, type: 'robot', message: 'Welcome to SRIRAM.OS!', color: '#00E5FF' },
  { id: 's1', x: 920, y: 500, type: 'scientist', message: 'The AI Lab is cool!', color: '#FFD740' },
  { id: 'r2', x: 1120, y: 780, type: 'robot', message: 'Projects are this way!', color: '#E040FB' },
  { id: 's2', x: 560, y: 1100, type: 'scientist', message: 'Visit Skills Academy!', color: '#69F0AE' },
  { id: 'r3', x: 1500, y: 560, type: 'robot', message: 'Experience awaits!', color: '#FF4081' },
  { id: 's3', x: 1000, y: 1280, type: 'scientist', message: 'Contact Sriram below!', color: '#FFAB40' },
]

const PATHS = [
  { x: 160, y: 185, w: 1290, h: 14 },
  { x: 160, y: 975, w: 1290, h: 14 },
  { x: 230, y: 185, w: 14, h: 790 },
  { x: 805, y: 185, w: 14, h: 790 },
  { x: 1370, y: 185, w: 14, h: 790 },
  { x: 230, y: 575, w: 1154, h: 14 },
]

/* Seeded random for deterministic world generation */
function makeRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
}

function genGrass() {
  const r = makeRng(42)
  const out: { x: number; y: number; w: number; h: number; s: number }[] = []
  for (let i = 0; i < 500; i++) {
    out.push({ x: (r() * WORLD_W) | 0, y: (r() * WORLD_H) | 0, w: (r() * 8 + 2) | 0, h: (r() * 5 + 2) | 0, s: (r() * 3) | 0 })
  }
  return out
}

function genStars() {
  const r = makeRng(77)
  const out: { x: number; y: number; b: number; spd: number }[] = []
  for (let i = 0; i < 100; i++) {
    out.push({ x: (r() * WORLD_W * 1.5) | 0, y: (r() * WORLD_H * 1.5) | 0, b: r(), spd: r() * 0.03 + 0.008 })
  }
  return out
}

function genTrees() {
  const r = makeRng(303)
  const out: { x: number; y: number; size: number }[] = []
  for (let i = 0; i < 45; i++) {
    const tx = (r() * (WORLD_W - 40) + 20) | 0
    const ty = (r() * (WORLD_H - 40) + 20) | 0
    const onPath = PATHS.some(p => tx > p.x - 20 && tx < p.x + p.w + 20 && ty > p.y - 20 && ty < p.y + p.h + 20)
    const onBuilding = BUILDINGS.some(b => tx > b.x - 30 && tx < b.x + b.w + 30 && ty > b.y - 30 && ty < b.y + b.h + 30)
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
  for (let i = 0; i < 70; i++) {
    out.push({ x: (r() * WORLD_W) | 0, y: (r() * WORLD_H) | 0, c: colors[(r() * colors.length) | 0] })
  }
  return out
}

function genLamps() {
  return [
    { x: 230, y: 370 }, { x: 230, y: 560 }, { x: 230, y: 760 },
    { x: 805, y: 370 }, { x: 805, y: 560 }, { x: 805, y: 760 },
    { x: 1370, y: 370 }, { x: 1370, y: 560 }, { x: 1370, y: 760 },
    { x: 450, y: 185 }, { x: 650, y: 185 }, { x: 1000, y: 185 },
    { x: 450, y: 975 }, { x: 650, y: 975 }, { x: 1000, y: 975 },
  ]
}

const GRASS = genGrass()
const STARS = genStars()
const TREES = genTrees()
const FLOWERS = genFlowers()
const LAMPS = genLamps()

const GRASS_SHADES = ['#0a2d50', '#0d365a', '#103f64']

/* ═══════════════════ Drawing Helpers ═══════════════════ */

function drawBackground(ctx: CanvasRenderingContext2D, vw: number, vh: number, camX: number, camY: number, time: number) {
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, vw, vh)

  // Stars (parallax 0.4x)
  for (const st of STARS) {
    const sx = (st.x * 0.4 - camX * 0.4) | 0
    const sy = (st.y * 0.4 - camY * 0.4) | 0
    if (sx < -2 || sx > vw + 2 || sy < -2 || sy > vh + 2) continue
    const brightness = (Math.sin(time * st.spd * 60 + st.b * 100) + 1) / 2
    ctx.fillStyle = `rgba(255,255,255,${(0.2 + brightness * 0.8).toFixed(2)})`
    ctx.fillRect(sx, sy, 1 + (brightness > 0.7 ? 1 : 0), 1)
  }
}

function drawGround(ctx: CanvasRenderingContext2D, vw: number, vh: number, camX: number, camY: number) {
  // Grass patches
  for (const g of GRASS) {
    const gx = (g.x - camX) | 0
    const gy = (g.y - camY) | 0
    if (gx < -12 || gx > vw + 12 || gy < -12 || gy > vh + 12) continue
    ctx.fillStyle = GRASS_SHADES[g.s]
    ctx.fillRect(gx, gy, g.w, g.h)
  }

  // Paths
  for (const p of PATHS) {
    const px = (p.x - camX) | 0
    const py = (p.y - camY) | 0
    if (px > vw + p.w || px + p.w < 0 || py > vh + p.h || py + p.h < 0) continue
    ctx.fillStyle = '#2c2c54'
    ctx.fillRect(px, py, p.w, p.h)
    ctx.fillStyle = '#3d3d6b'
    ctx.fillRect(px, py, p.w, 1)
    ctx.fillRect(px, py + p.h - 1, p.w, 1)
  }
}

function drawFlowers(ctx: CanvasRenderingContext2D, vw: number, vh: number, camX: number, camY: number) {
  for (const f of FLOWERS) {
    const fx = (f.x - camX) | 0
    const fy = (f.y - camY) | 0
    if (fx < -4 || fx > vw + 4 || fy < -4 || fy > vh + 4) continue
    ctx.fillStyle = f.c
    ctx.fillRect(fx, fy, 2, 2)
    ctx.fillStyle = '#1B5E20'
    ctx.fillRect(fx, fy + 2, 1, 2)
  }
}

function drawTree(ctx: CanvasRenderingContext2D, tree: { x: number; y: number; size: number }, camX: number, camY: number, vw: number, vh: number) {
  const tx = (tree.x - camX) | 0
  const ty = (tree.y - camY) | 0
  if (tx < -20 || tx > vw + 20 || ty < -30 || ty > vh + 10) return
  const s = tree.size
  // Trunk
  ctx.fillStyle = '#5D4037'
  ctx.fillRect(tx + 2 * s, ty, 2 * s, 6 * s)
  // Leaves
  ctx.fillStyle = '#1B5E20'
  ctx.fillRect(tx, ty - 6 * s, 6 * s, 7 * s)
  ctx.fillStyle = '#2E7D32'
  ctx.fillRect(tx + s, ty - 8 * s, 4 * s, 4 * s)
  ctx.fillStyle = '#388E3C'
  ctx.fillRect(tx + 2 * s, ty - 9 * s, 2 * s, 2 * s)
}

function drawLamp(ctx: CanvasRenderingContext2D, lamp: { x: number; y: number }, camX: number, camY: number, vw: number, vh: number, time: number) {
  const lx = (lamp.x - camX) | 0
  const ly = (lamp.y - camY) | 0
  if (lx < -10 || lx > vw + 10 || ly < -20 || ly > vh + 10) return

  // Pole
  ctx.fillStyle = '#78909C'
  ctx.fillRect(lx, ly - 14, 2, 14)

  // Light fixture
  ctx.fillStyle = '#FFF9C4'
  ctx.fillRect(lx - 2, ly - 16, 6, 3)

  // Glow
  const flicker = 0.15 + Math.sin(time * 0.008 + lamp.x) * 0.05
  ctx.fillStyle = `rgba(255,249,196,${flicker.toFixed(2)})`
  ctx.fillRect(lx - 6, ly - 20, 14, 8)
  ctx.fillRect(lx - 4, ly - 12, 10, 6)
}

function drawCenterMonument(ctx: CanvasRenderingContext2D, camX: number, camY: number, vw: number, vh: number, time: number) {
  const cx = 970
  const cy = 680
  const mx = (cx - camX) | 0
  const my = (cy - camY) | 0
  if (mx < -60 || mx > vw + 60 || my < -60 || my > vh + 60) return

  // Plaza floor
  ctx.fillStyle = '#1a237e'
  ctx.fillRect(mx - 30, my + 10, 60, 40)
  ctx.fillStyle = '#283593'
  ctx.fillRect(mx - 26, my + 14, 52, 32)

  // Pedestal
  ctx.fillStyle = '#37474F'
  ctx.fillRect(mx - 12, my - 4, 24, 16)

  // Screen/monitor
  ctx.fillStyle = '#263238'
  ctx.fillRect(mx - 10, my - 24, 20, 20)

  // Screen glow
  const glow = (Math.sin(time * 0.003) + 1) / 2
  ctx.fillStyle = `rgba(0,229,255,${(0.4 + glow * 0.4).toFixed(2)})`
  ctx.fillRect(mx - 8, my - 22, 16, 16)

  // Text on screen
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '5px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('S.OS', mx, my - 14)

  // Antenna
  ctx.fillStyle = '#78909C'
  ctx.fillRect(mx, my - 30, 1, 6)
  ctx.fillStyle = '#00E5FF'
  ctx.fillRect(mx - 1, my - 31, 3, 2)
}

function drawBuilding(ctx: CanvasRenderingContext2D, b: BuildingData, camX: number, camY: number, vw: number, vh: number, time: number, charX: number, charY: number) {
  const bx = (b.x - camX) | 0
  const by = (b.y - camY) | 0
  if (bx + b.w < -20 || bx > vw + 20 || by + b.h < -30 || by > vh + 20) return

  const bcx = b.x + b.w / 2
  const bcy = b.y + b.h / 2
  const dist = Math.hypot(charX + 8 - bcx, charY + 12 - bcy)
  const isNear = dist < INTERACT_DIST

  // Entrance glow when near
  if (isNear) {
    const alpha = Math.min(0.25, (INTERACT_DIST - dist) / INTERACT_DIST * 0.25)
    ctx.fillStyle = `${b.glowColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
    ctx.fillRect(bx + (b.w / 2 - 16) | 0, by + b.h - 8, 32, 8)
  }

  // Roof
  ctx.fillStyle = b.color
  ctx.fillRect(bx - 5, by - 14, b.w + 10, 16)

  // Roof accent
  ctx.fillStyle = b.glowColor
  const roofPulse = (Math.sin(time * 0.004 + b.x * 0.1) + 1) / 2
  ctx.globalAlpha = 0.3 + roofPulse * 0.4
  ctx.fillRect(bx - 3, by - 12, b.w + 6, 2)
  ctx.globalAlpha = 1

  // Rooftop antenna
  ctx.fillStyle = '#78909C'
  ctx.fillRect(bx + (b.w / 2) | 0, by - 22, 2, 8)
  ctx.fillStyle = b.glowColor
  ctx.fillRect(bx + (b.w / 2 - 1) | 0, by - 24, 4, 3)

  // Main structure
  ctx.fillStyle = b.color
  ctx.fillRect(bx, by, b.w, b.h)

  // Building side shade
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.fillRect(bx + b.w - 4, by, 4, b.h)

  // Windows
  const windowGlow = (Math.sin(time * 0.002 + b.x * 0.05) + 1) / 2
  for (let wy = by + 16; wy < by + b.h - 26; wy += 18) {
    for (let wx = bx + 14; wx < bx + b.w - 18; wx += 24) {
      if (windowGlow > 0.4) {
        ctx.fillStyle = `rgba(255,249,196,${(windowGlow * 0.12).toFixed(2)})`
        ctx.fillRect(wx - 1, wy - 1, 12, 12)
      }
      ctx.fillStyle = '#FFF9C4'
      ctx.fillRect(wx, wy, 10, 10)
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.fillRect(wx + 4, wy, 2, 10)
      ctx.fillRect(wx, wy + 4, 10, 2)
    }
  }

  // Door
  ctx.fillStyle = '#3E2723'
  ctx.fillRect(bx + (b.w / 2 - 8) | 0, by + b.h - 20, 16, 20)
  ctx.fillStyle = '#5D4037'
  ctx.fillRect(bx + (b.w / 2 - 6) | 0, by + b.h - 18, 12, 16)
  ctx.fillStyle = '#FFD740'
  ctx.fillRect(bx + (b.w / 2 + 3) | 0, by + b.h - 10, 2, 2)

  // Sign with glow
  ctx.save()
  ctx.shadowColor = b.glowColor
  ctx.shadowBlur = 6
  ctx.fillStyle = b.glowColor
  ctx.font = 'bold 7px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText(b.name, bx + (b.w / 2) | 0, by - 26)
  ctx.restore()

  // Bright text on top of glow
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 7px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText(b.name, bx + (b.w / 2) | 0, by - 26)
}

function drawNPC(ctx: CanvasRenderingContext2D, npc: NPCData, camX: number, camY: number, vw: number, vh: number, charX: number, charY: number, time: number) {
  const nx = (npc.x - camX) | 0
  const ny = (npc.y - camY) | 0
  if (nx < -20 || nx > vw + 20 || ny < -40 || ny > vh + 20) return

  const dist = Math.hypot(npc.x - charX - 8, npc.y - charY - 12)

  if (npc.type === 'robot') {
    // Body
    ctx.fillStyle = npc.color
    ctx.fillRect(nx - 5, ny - 12, 10, 12)
    // Head
    ctx.fillStyle = '#B0BEC5'
    ctx.fillRect(nx - 4, ny - 20, 8, 8)
    // Eyes
    const blink = Math.sin(time * 0.005) > 0.92 ? 0 : 1
    ctx.fillStyle = '#F44336'
    ctx.fillRect(nx - 2, ny - 17, 2, 2 * blink)
    ctx.fillRect(nx + 1, ny - 17, 2, 2 * blink)
    // Antenna
    ctx.fillStyle = npc.color
    ctx.fillRect(nx, ny - 23, 1, 3)
    ctx.fillRect(nx - 1, ny - 25, 3, 2)
    // Hover bob
    const hb = Math.sin(time * 0.006 + npc.x) * 1.5
    if (Math.abs(hb) > 0.5) {
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.fillRect(nx - 4, ny + 1, 8, 2)
    }
  } else {
    // Lab coat body
    ctx.fillStyle = '#ECEFF1'
    ctx.fillRect(nx - 5, ny - 12, 10, 14)
    // Head
    ctx.fillStyle = '#FFCCBC'
    ctx.fillRect(nx - 4, ny - 20, 8, 8)
    // Hair
    ctx.fillStyle = '#5D4037'
    ctx.fillRect(nx - 4, ny - 22, 8, 4)
    // Glasses
    ctx.fillStyle = '#263238'
    ctx.fillRect(nx - 3, ny - 17, 3, 2)
    ctx.fillRect(nx + 1, ny - 17, 3, 2)
    ctx.fillRect(nx, ny - 17, 1, 2)
    // Legs
    ctx.fillStyle = '#455A64'
    ctx.fillRect(nx - 3, ny + 2, 3, 4)
    ctx.fillRect(nx + 1, ny + 2, 3, 4)
  }

  // Speech bubble
  if (dist < NPC_DIST) {
    const alpha = Math.min(1, (NPC_DIST - dist) / 20)
    ctx.globalAlpha = alpha
    const text = npc.message
    ctx.font = '5px monospace'
    const tw = ctx.measureText(text).width
    const bw = tw + 8
    const bh = 11
    const bubX = (nx - bw / 2) | 0
    const bubY = ny - (npc.type === 'robot' ? 38 : 38)

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(bubX, bubY, bw, bh)
    // Tail
    ctx.fillRect(nx - 1, bubY + bh, 2, 3)
    // Border
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 0.5
    ctx.strokeRect(bubX, bubY, bw, bh)
    // Text
    ctx.fillStyle = '#212121'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, nx, bubY + bh / 2 + 1)
    ctx.globalAlpha = 1
  }
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  dir: string,
  frame: number,
  isMoving: boolean,
  idleBob: number,
  time: number
) {
  const bob = isMoving ? 0 : Math.round(Math.sin(idleBob * 0.12) * 1.5)
  const walkBob = isMoving ? Math.round(Math.sin(time * 0.018) * 1) : 0

  ctx.save()
  ctx.translate(screenX | 0, (screenY + bob) | 0)

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.fillRect(1, 22, 14, 4)

  // Legs
  ctx.fillStyle = '#006064'
  if (!isMoving) {
    ctx.fillRect(3, 16, 4, 8)
    ctx.fillRect(9, 16, 4, 8)
  } else if (frame === 1) {
    ctx.fillRect(2, 16, 4, 8)
    ctx.fillRect(10, 18, 4, 6)
  } else if (frame === 3) {
    ctx.fillRect(4, 18, 4, 6)
    ctx.fillRect(8, 16, 4, 8)
  } else {
    ctx.fillRect(3, 17, 4, 7)
    ctx.fillRect(9, 17, 4, 7)
  }

  // Body
  ctx.fillStyle = '#00E5FF'
  ctx.fillRect(2, 8 + walkBob, 12, 8)
  // Body stripe
  ctx.fillStyle = '#00BCD4'
  ctx.fillRect(2, 12 + walkBob, 12, 1)

  // Arms
  const armSwing = isMoving ? (frame === 1 ? -2 : frame === 3 ? 2 : 0) : 0
  ctx.fillStyle = '#00BCD4'
  ctx.fillRect(-1, 9 + walkBob + armSwing, 3, 5)
  ctx.fillRect(14, 9 + walkBob - armSwing, 3, 5)

  // Head
  ctx.fillStyle = '#FFE0B2'
  ctx.fillRect(3, 0, 10, 8)

  // Hair
  ctx.fillStyle = '#4E342E'
  ctx.fillRect(3, 0, 10, 3)
  if (dir === 'left') ctx.fillRect(3, 0, 2, 5)
  else if (dir === 'right') ctx.fillRect(11, 0, 2, 5)

  // Eyes
  ctx.fillStyle = '#212121'
  if (dir === 'down') {
    ctx.fillRect(5, 4, 2, 2)
    ctx.fillRect(9, 4, 2, 2)
    ctx.fillRect(7, 6, 2, 1)
  } else if (dir === 'up') {
    ctx.fillStyle = '#4E342E'
    ctx.fillRect(3, 2, 10, 2)
  } else if (dir === 'left') {
    ctx.fillRect(4, 4, 2, 2)
    ctx.fillRect(7, 4, 2, 2)
    ctx.fillRect(5, 6, 2, 1)
  } else {
    ctx.fillRect(7, 4, 2, 2)
    ctx.fillRect(10, 4, 2, 2)
    ctx.fillRect(9, 6, 2, 1)
  }

  ctx.restore()
}

function drawMinimap(ctx: CanvasRenderingContext2D, vw: number, vh: number, charX: number, charY: number, camX: number, camY: number) {
  const mw = 90
  const mh = 68
  const mx = vw - mw - 8
  const my = 8
  const sx = mw / WORLD_W
  const sy = mh / WORLD_H

  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fillRect(mx - 1, my - 1, mw + 2, mh + 2)
  ctx.fillStyle = 'rgba(26,26,46,0.8)'
  ctx.fillRect(mx, my, mw, mh)

  // Paths
  ctx.fillStyle = 'rgba(44,44,84,0.7)'
  for (const p of PATHS) {
    ctx.fillRect(mx + p.x * sx, my + p.y * sy, Math.max(p.w * sx, 1), Math.max(p.h * sy, 1))
  }

  // Buildings
  for (const b of BUILDINGS) {
    ctx.fillStyle = b.glowColor
    ctx.fillRect(mx + b.x * sx, my + b.y * sy, Math.max(b.w * sx, 3), Math.max(b.h * sy, 2))
  }

  // Viewport rect
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(mx + camX * sx, my + camY * sy, vw * sx, vh * sy)

  // Character dot
  ctx.fillStyle = '#00E5FF'
  ctx.fillRect(mx + charX * sx - 1, my + charY * sy - 1, 3, 3)

  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 1
  ctx.strokeRect(mx - 1, my - 1, mw + 2, mh + 2)
}

function drawPrompt(ctx: CanvasRenderingContext2D, building: BuildingData | null, camX: number, camY: number, isMobile: boolean, time: number) {
  if (!building) return

  const bx = (building.x + building.w / 2 - camX) | 0
  const by = (building.y + building.h + 14 - camY) | 0
  const text = isMobile ? 'Tap [E] to enter' : 'Press E to enter'

  ctx.font = '6px monospace'
  const tw = ctx.measureText(text).width
  const pw = tw + 10
  const ph = 13

  // Pulsing alpha
  const alpha = 0.7 + Math.sin(time * 0.006) * 0.3
  ctx.globalAlpha = alpha

  ctx.fillStyle = 'rgba(0,0,0,0.75)'
  ctx.fillRect(bx - pw / 2, by, pw, ph)

  ctx.fillStyle = building.glowColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, bx, by + ph / 2)

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
    charX: WORLD_W / 2 - 8,
    charY: WORLD_H / 2 - 12,
    dir: 'down' as 'left' | 'right' | 'up' | 'down',
    frame: 0,
    frameTimer: 0,
    isMoving: false,
    camX: 0,
    camY: 0,
    nearBuilding: null as string | null,
    idleBob: 0,
    targetX: -1,
    targetY: -1,
  })

  const keysRef = useRef(new Set<string>())
  const joystickRef = useRef({ active: false, dx: 0, dy: 0 })
  const thumbRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])

  const [isMobile, setIsMobile] = useState(false)
  const [nearBuilding, setNearBuilding] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(true)

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
    check()
    const onResize = () => check()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Hide help
  useEffect(() => {
    const t = setTimeout(() => setShowHelp(false), 6000)
    return () => clearTimeout(t)
  }, [])

  // Find nearest building
  const findNearBuilding = useCallback((cx: number, cy: number): BuildingData | null => {
    let nearest: BuildingData | null = null
    let minDist = INTERACT_DIST
    for (const b of BUILDINGS) {
      const d = Math.hypot(cx - (b.x + b.w / 2), cy - (b.y + b.h / 2))
      if (d < minDist) { minDist = d; nearest = b }
    }
    return nearest
  }, [])

  // Interact
  const interact = useCallback(() => {
    const s = stateRef.current
    const b = findNearBuilding(s.charX + 8, s.charY + 12)
    if (b) onBuildingClick(b.id)
  }, [onBuildingClick, findNearBuilding])

  // Keyboard
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

  // Canvas click-to-move
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

  // Touch tap-to-move on canvas
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

  // Joystick handlers
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

      // Click/tap to move
      if (s.targetX >= 0 && s.targetY >= 0 && !joy.active && dx === 0 && dy === 0) {
        const tdx = s.targetX - (s.charX + 8)
        const tdy = s.targetY - (s.charY + 12)
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

      // Normalize
      const len = Math.hypot(dx, dy)
      if (len > 0.01) {
        const speed = CHAR_SPEED
        dx = dx / len * speed
        dy = dy / len * speed
        s.isMoving = true

        if (Math.abs(dx) > Math.abs(dy)) s.dir = dx > 0 ? 'right' : 'left'
        else s.dir = dy > 0 ? 'down' : 'up'

        s.frameTimer++
        if (s.frameTimer >= 7) { s.frameTimer = 0; s.frame = (s.frame + 1) % 4 }

        // Dust particles
        if (time % 8 === 0) {
          particlesRef.current.push({
            x: s.charX + 8 + (Math.random() - 0.5) * 6,
            y: s.charY + 23,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -Math.random() * 0.3 - 0.1,
            life: 18, maxLife: 18,
            color: '#4a4a6a', size: 2,
          })
        }
      } else {
        s.isMoving = false
        s.frame = 0; s.frameTimer = 0
        s.idleBob++
      }

      // Move character
      s.charX = Math.max(0, Math.min(WORLD_W - 16, s.charX + dx))
      s.charY = Math.max(0, Math.min(WORLD_H - 24, s.charY + dy))

      // Camera (smooth follow)
      const targetCamX = s.charX + 8 - vw / 2
      const targetCamY = s.charY + 12 - vh / 2
      const clampedX = Math.max(0, Math.min(WORLD_W - vw, targetCamX))
      const clampedY = Math.max(0, Math.min(WORLD_H - vh, targetCamY))
      s.camX += (clampedX - s.camX) * CAM_LERP
      s.camY += (clampedY - s.camY) * CAM_LERP

      // Near building detection
      const nearB = findNearBuilding(s.charX + 8, s.charY + 12)
      const newNear = nearB?.id ?? null
      if (newNear !== s.nearBuilding) {
        s.nearBuilding = newNear
        setNearBuilding(newNear)
      }

      // Update particles
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

      // Trees (behind buildings/character)
      for (const tree of TREES) drawTree(offCtx, tree, camX, camY, vw, vh)

      // Lamps
      for (const lamp of LAMPS) drawLamp(offCtx, lamp, camX, camY, vw, vh, time)

      // Center monument
      drawCenterMonument(offCtx, camX, camY, vw, vh, time)

      // Y-sorted entities: buildings + NPCs + character
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
        y: s.charY + 24,
        draw: () => drawCharacter(offCtx, s.charX - camX, s.charY - camY, s.dir, s.frame, s.isMoving, s.idleBob, time),
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
      drawMinimap(offCtx, vw, vh, s.charX, s.charY, camX, camY)

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
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#1a1a2e]" style={{ minHeight: '300px' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair"
        style={{ imageRendering: 'pixelated' }}
        onClick={handleCanvasClick}
        onTouchEnd={handleCanvasTouch}
      />

      {/* Mobile virtual joystick */}
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

      {/* Mobile action button */}
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

      {/* Help text */}
      {showHelp && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white/80 px-5 py-2 rounded-lg text-xs font-mono pointer-events-none backdrop-blur-sm border border-white/10 animate-pulse">
          {isMobile
            ? 'Tap to move \u2022 Joystick to walk \u2022 Tap E near buildings'
            : 'WASD / Arrow Keys to move \u2022 E to interact \u2022 Click to walk'}
        </div>
      )}
    </div>
  )
}
