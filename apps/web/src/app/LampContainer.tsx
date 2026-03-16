'use client'

import React from 'react'
import { motion } from 'framer-motion'

const BG = '#0a0908'

export function LampContainer({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative w-full pt-16 pb-8 ${className}`}>
      {/* Lamp rays — explicit height so absolute children are visible */}
      <div className="relative h-48 w-full overflow-hidden flex items-end justify-center">
        {/* Left ray */}
        <motion.div
          initial={{ opacity: 0.5, width: '8rem' }}
          whileInView={{ opacity: 1, width: '20rem' }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          style={{
            backgroundImage: 'conic-gradient(var(--conic-position), var(--tw-gradient-stops))',
          }}
          className="absolute bottom-0 right-1/2 h-40 w-[20rem] bg-gradient-conic from-violet-600 via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
        >
          <div
            className="absolute w-32 h-full left-0 bottom-0 z-10 [mask-image:linear-gradient(to_right,white,transparent)]"
            style={{ background: BG }}
          />
        </motion.div>

        {/* Right ray */}
        <motion.div
          initial={{ opacity: 0.5, width: '8rem' }}
          whileInView={{ opacity: 1, width: '20rem' }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          style={{
            backgroundImage: 'conic-gradient(var(--conic-position), var(--tw-gradient-stops))',
          }}
          className="absolute bottom-0 left-1/2 h-40 w-[20rem] bg-gradient-conic from-transparent via-transparent to-violet-600 [--conic-position:from_290deg_at_center_top]"
        >
          <div
            className="absolute w-32 h-full right-0 bottom-0 z-10 [mask-image:linear-gradient(to_left,white,transparent)]"
            style={{ background: BG }}
          />
        </motion.div>

        {/* Center glow blob */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 h-20 w-64 rounded-full opacity-50 blur-3xl"
          style={{ background: 'rgba(139,92,246,0.8)' }}
        />

        {/* Center hot spot */}
        <motion.div
          initial={{ width: '5rem' }}
          whileInView={{ width: '12rem' }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 h-16 rounded-full blur-2xl"
          style={{ background: 'rgba(167,139,250,0.6)' }}
        />

        {/* Horizontal beam line */}
        <motion.div
          initial={{ width: '8rem' }}
          whileInView={{ width: '20rem' }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 h-px"
          style={{ background: 'rgba(196,181,253,0.9)' }}
        />

        {/* Bottom fade to bg */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 z-40"
          style={{ background: `linear-gradient(to top, ${BG}, transparent)` }}
        />
      </div>

      {/* Content — sits below lamp with a small negative margin to overlap glow */}
      <div className="relative z-50 -mt-6 flex flex-col items-center px-5 w-full">
        {children}
      </div>
    </div>
  )
}
