"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef } from "react"

type Item = {
  src: string
  href: string
  alt?: string
}

export default function InfiniteGallery({
  items,
  speedPxPerSec = 40,
}: {
  items: Item[]
  speedPxPerSec?: number
}) {
  const group = useMemo(() => items, [items])

  const viewportRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const offsetRef = useRef(0)
  const halfWidthRef = useRef(0)

  // サイズ計測
  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return
      halfWidthRef.current = trackRef.current.scrollWidth / 2
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [group.length])

  // 自動スクロール
  useEffect(() => {
    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts
      const dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts

      const half = halfWidthRef.current
      if (half > 0 && trackRef.current) {
        offsetRef.current += speedPxPerSec * dt
        if (offsetRef.current >= half) offsetRef.current -= half
        trackRef.current.style.transform = `translate3d(${-offsetRef.current}px,0,0)`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [speedPxPerSec])

  return (
    <div className="marquee">
      <div
        ref={viewportRef}
        className="
          marquee__viewport
          overflow-x-auto
          no-scrollbar
          touch-pan-x
        "
      >
        <div ref={trackRef} className="marquee__track">
          {[0, 1].map((_, g) => (
            <div key={g} className="marquee__group">
              {group.map((it, i) => (
                <Link
                  key={`${it.src}-${g}-${i}`}
                  href={it.href}
                  className="flex-shrink-0"
                >
                  <div className="marquee__item">
                    <div className="relative w-[160px] h-[96px]">
                      <Image
                        src={it.src}
                        alt={it.alt ?? ""}
                        fill
                        className="object-cover rounded-lg"
                        sizes="160px"
                        quality={60}
                        draggable={false}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}