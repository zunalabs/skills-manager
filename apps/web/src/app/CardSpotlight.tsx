'use client'

import { useMotionValue, motion, useMotionTemplate } from 'framer-motion'
import React, { MouseEvent as ReactMouseEvent } from 'react'

export function CardSpotlight({
  children,
  radius = 300,
  color = 'rgba(124,58,237,0.12)',
  className,
  style,
  ...props
}: {
  radius?: number
  color?: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
} & React.HTMLAttributes<HTMLDivElement>) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: ReactMouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      className={`group/spotlight relative ${className ?? ''}`}
      style={style}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-0 transition duration-300 group-hover/spotlight:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, ${color}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  )
}
