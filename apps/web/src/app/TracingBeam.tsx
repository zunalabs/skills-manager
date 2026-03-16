'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useTransform, useScroll, useSpring } from 'framer-motion'

export function TracingBeam({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const contentRef = useRef<HTMLDivElement>(null)
  const [svgHeight, setSvgHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setSvgHeight(contentRef.current.offsetHeight)
    }
  }, [])

  const y1 = useSpring(useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]), {
    stiffness: 500,
    damping: 90,
  })
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [50, svgHeight - 200]), {
    stiffness: 500,
    damping: 90,
  })

  return (
    <motion.div ref={ref} className={`relative w-full ${className ?? ''}`}>
      <div className="absolute top-3 left-8 hidden md:block">
        <div className="ml-[27px] flex h-4 w-4 items-center justify-center rounded-full border border-[rgba(255,255,255,0.1)]">
          <div className="h-2 w-2 rounded-full bg-violet-500 opacity-70" />
        </div>
        <svg
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
          height={svgHeight}
          className="ml-4 block"
          aria-hidden
        >
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
          />
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="url(#tracing-gradient)"
            strokeWidth="1.25"
          />
          <defs>
            <motion.linearGradient
              id="tracing-gradient"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={y1}
              y2={y2}
            >
              <stop stopColor="#7c3aed" stopOpacity="0" />
              <stop stopColor="#7c3aed" />
              <stop offset="0.5" stopColor="#a855f7" />
              <stop offset="1" stopColor="#c084fc" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef}>{children}</div>
    </motion.div>
  )
}
