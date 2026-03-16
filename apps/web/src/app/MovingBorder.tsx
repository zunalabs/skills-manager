'use client'

import React, { useRef } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from 'framer-motion'

export function MovingBorderButton({
  children,
  as: Component = 'button',
  containerClassName = '',
  innerClassName = '',
  borderColor = 'rgba(168,85,247,0.8)',
  borderRadius = '9999px',
  duration = 3000,
  ...props
}: {
  children: React.ReactNode
  as?: any
  containerClassName?: string
  innerClassName?: string
  borderColor?: string
  borderRadius?: string
  duration?: number
  [key: string]: any
}) {
  return (
    <Component
      className={`relative overflow-hidden p-px ${containerClassName}`}
      style={{ borderRadius }}
      {...props}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        <MovingBorderTrail duration={duration} rx="50%" ry="50%" borderColor={borderColor} />
      </div>
      <div
        className={`relative flex h-full w-full items-center justify-center ${innerClassName}`}
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        {children}
      </div>
    </Component>
  )
}

function MovingBorderTrail({
  duration = 3000,
  rx,
  ry,
  borderColor,
}: {
  duration?: number
  rx?: string
  ry?: string
  borderColor: string
}) {
  const pathRef = useRef<SVGRectElement>(null)
  const progress = useMotionValue(0)

  useAnimationFrame((time) => {
    const el = pathRef.current as unknown as SVGGeometryElement | null
    const length = el?.getTotalLength()
    if (length) {
      progress.set((time * (length / duration)) % length)
    }
  })

  const x = useTransform(progress, (val) => {
    const el = pathRef.current as unknown as SVGGeometryElement | null
    return el?.getPointAtLength(val).x ?? 0
  })
  const y = useTransform(progress, (val) => {
    const el = pathRef.current as unknown as SVGGeometryElement | null
    return el?.getPointAtLength(val).y ?? 0
  })
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
      >
        <rect fill="none" width="100%" height="100%" rx={rx} ry={ry} ref={pathRef} />
      </svg>
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'inline-block',
          transform,
        }}
      >
        <div
          className="h-16 w-16"
          style={{
            background: `radial-gradient(${borderColor} 40%, transparent 60%)`,
          }}
        />
      </motion.div>
    </>
  )
}
