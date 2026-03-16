'use client'

import React from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'

export function HeroHighlight({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const background = useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.04), transparent 80%)`

  return (
    <div
      className={`relative w-full ${className}`}
      onMouseMove={handleMouseMove}
      style={{
        backgroundImage:
          'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      {/* Mouse-following glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background }}
      />
      {/* Static center glow to always look good */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 60%)',
        }}
      />
      {/* Fade edges so dot grid blends into bg */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 50% at 50% 100%, #0a0908 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, #0a0908 0%, transparent 10%, transparent 90%, #0a0908 100%)',
        }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}

export function Highlight({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.span
      initial={{ backgroundSize: '0% 100%' }}
      animate={{ backgroundSize: '100% 100%' }}
      transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.5 }}
      style={{
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left center',
        display: 'inline',
      }}
      className={`relative inline-block pb-1 px-1 rounded-sm bg-gradient-to-r from-white/20 to-white/10 bg-[length:0%_100%] text-white ${className}`}
    >
      {children}
    </motion.span>
  )
}
