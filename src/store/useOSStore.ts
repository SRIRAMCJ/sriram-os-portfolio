import { create } from 'zustand'

export type Screen = 'boot' | 'login' | 'desktop'
export type WindowId = 'about' | 'experience' | 'projects' | 'skills' | 'certifications' | 'research' | 'resume' | 'contact' | 'terminal' | 'achievements' | 'secret' | 'snake' | 'settings'

interface OSState {
  currentScreen: Screen
  setScreen: (screen: Screen) => void
  visitorName: string
  setVisitorName: (name: string) => void
  openWindows: WindowId[]
  activeWindow: WindowId | null
  openWindow: (id: WindowId) => void
  closeWindow: (id: WindowId) => void
  focusWindow: (id: WindowId) => void
  minimizeWindow: (id: WindowId) => void
  assistantOpen: boolean
  toggleAssistant: () => void
  assistantMessages: ChatMessage[]
  addAssistantMessage: (msg: ChatMessage) => void
  clearAssistantMessages: () => void
  soundEnabled: boolean
  toggleSound: () => void
  showParticles: boolean
  toggleParticles: () => void
  secretUnlocked: boolean
  unlockSecret: () => void
  bootComplete: boolean
  setBootComplete: (v: boolean) => void
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export const useOSStore = create<OSState>((set, get) => ({
  currentScreen: 'boot',
  setScreen: (screen) => set({ currentScreen: screen }),
  visitorName: '',
  setVisitorName: (name) => set({ visitorName: name }),
  openWindows: [],
  activeWindow: null,
  openWindow: (id) => {
    const { openWindows } = get()
    if (!openWindows.includes(id)) {
      set({ openWindows: [...openWindows, id], activeWindow: id })
    } else {
      set({ activeWindow: id })
    }
  },
  closeWindow: (id) => {
    const { openWindows, activeWindow } = get()
    const newWindows = openWindows.filter(w => w !== id)
    set({
      openWindows: newWindows,
      activeWindow: activeWindow === id ? (newWindows[newWindows.length - 1] || null) : activeWindow
    })
  },
  focusWindow: (id) => {
    const { openWindows } = get()
    if (openWindows.includes(id)) {
      const newWindows = [...openWindows.filter(w => w !== id), id]
      set({ openWindows: newWindows, activeWindow: id })
    }
  },
  minimizeWindow: (id) => {
    const { openWindows, activeWindow } = get()
    const newWindows = openWindows.filter(w => w !== id)
    set({
      openWindows: newWindows,
      activeWindow: activeWindow === id ? (newWindows[newWindows.length - 1] || null) : activeWindow
    })
  },
  assistantOpen: false,
  toggleAssistant: () => set(s => ({ assistantOpen: !s.assistantOpen })),
  assistantMessages: [],
  addAssistantMessage: (msg) => set(s => ({ assistantMessages: [...s.assistantMessages, msg] })),
  clearAssistantMessages: () => set({ assistantMessages: [] }),
  soundEnabled: true,
  toggleSound: () => set(s => ({ soundEnabled: !s.soundEnabled })),
  showParticles: true,
  toggleParticles: () => set(s => ({ showParticles: !s.showParticles })),
  secretUnlocked: false,
  unlockSecret: () => set({ secretUnlocked: true }),
  bootComplete: false,
  setBootComplete: (v) => set({ bootComplete: v }),
}))
