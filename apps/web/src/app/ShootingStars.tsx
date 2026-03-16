'use client'

import React, { useEffect, useState, useRef } from 'react'

interface Star {
  id: number
  x: number
  y: number
  angle: number
  scale: number
  speed: number
  distance: number
}

function getRandomStartPoint(): { x: number; y: number; angle: number } {
  if (typeof window === 'undefined') return { x: 0, y: 0, angle: 45 }
  const side = Math.floor(Math.random() * 4)
  const offset = Math.random() * window.innerWidth
  switch (side) {
    case 0: return { x: offset, y: 0, angle: 45 }
    case 1: return { x: window.innerWidth, y: offset, angle: 135 }
    case 2: return { x: offset, y: window.innerHeight, angle: 225 }
    default: return { x: 0, y: offset, angle: 315 }
  }
}

export function ShootingStars({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  starColor = '#7c3aed',
  trailColor = '#a78bfa',
  starWidth = 10,
  starHeight = 1,
  className = '',
}: {
  minSpeed?: number
  maxSpeed?: number
  minDelay?: number
  maxDelay?: number
  starColor?: string
  trailColor?: string
  starWidth?: number
  starHeight?: number
  className?: string
}) {
  const [star, setStar] = useState<Star | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    const createStar = () => {
      const { x, y, angle } = getRandomStartPoint()
      setStar({
        id: Date.now(),
        x, y, angle,
        scale: 1,
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        distance: 0,
      })
      timeoutId = setTimeout(createStar, Math.random() * (maxDelay - minDelay) + minDelay)
    }
    timeoutId = setTimeout(createStar, 100)
    return () => clearTimeout(timeoutId)
  }, [minSpeed, maxSpeed, minDelay, maxDelay])

  useEffect(() => {
    let rafId: number
    const moveStar = () => {
      setStar((prev) => {
        if (!prev) return null
        const newX = prev.x + prev.speed * Math.cos((prev.angle * Math.PI) / 180)
        const newY = prev.y + prev.speed * Math.sin((prev.angle * Math.PI) / 180)
        const newDistance = prev.distance + prev.speed
        if (
          typeof window !== 'undefined' &&
          (newX < -20 || newX > window.innerWidth + 20 || newY < -20 || newY > window.innerHeight + 20)
        ) {
          return null
        }
        return { ...prev, x: newX, y: newY, distance: newDistance, scale: 1 + newDistance / 100 }
      })
      rafId = requestAnimationFrame(moveStar)
    }
    rafId = requestAnimationFrame(moveStar)
    return () => cancelAnimationFrame(rafId)
  }, [star?.id])

  return (
    <svg
      ref={svgRef}
      className={`w-full h-full absolute inset-0 pointer-events-none ${className}`}
    >
      {star && (
        <rect
          key={star.id}
          x={star.x}
          y={star.y}
          width={starWidth * star.scale}
          height={starHeight}
          fill="url(#shooting-gradient)"
          transform={`rotate(${star.angle}, ${star.x + (starWidth * star.scale) / 2}, ${star.y + starHeight / 2})`}
        />
      )}
      <defs>
        <linearGradient id="shooting-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
          <stop offset="100%" style={{ stopColor: starColor, stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </svg>
  )
}
