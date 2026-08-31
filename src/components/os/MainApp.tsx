'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useOSStore } from '@/store/useOSStore'
import BootScreen from '@/components/os/BootScreen'
import LoginScreen from '@/components/os/LoginScreen'
import Desktop from '@/components/os/Desktop'
import ParticleBackground from '@/components/effects/ParticleBackground'

export default function MainApp() {
  const currentScreen = useOSStore(s => s.currentScreen)
  const setScreen = useOSStore(s => s.setScreen)
  const setVisitorName = useOSStore(s => s.setVisitorName)

  return (
    <div className="h-screen w-screen bg-[#050816] overflow-hidden relative">
      <ParticleBackground />
      
      <AnimatePresence mode="wait">
        {currentScreen === 'boot' && (
          <motion.div
            key="boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10"
          >
            <BootScreen
              onComplete={() => setScreen('login')}
            />
          </motion.div>
        )}

        {currentScreen === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10"
          >
            <LoginScreen
              onLogin={(name) => {
                setVisitorName(name || 'Visitor')
                setScreen('desktop')
              }}
            />
          </motion.div>
        )}

        {currentScreen === 'desktop' && (
          <motion.div
            key="desktop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-10"
          >
            <Desktop />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
