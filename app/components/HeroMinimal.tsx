"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

type Props = {
  bgSrc: string
  title?: string
  subtitle?: string
  ctaHref?: string
}

export default function HeroMinimal({
  bgSrc,
  title = "Quiet moments",
  subtitle = "by Manami Osada",
  ctaHref = "#categories",
}: Props) {
  const [open, setOpen] = useState(false)

  // 「動いたら表示 / 止まったら消える」
  const [active, setActive] = useState(false)
  const hideTimerRef = useRef<number | null>(null)

  const ping = () => {
    setActive(true)

    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current)
    }

    hideTimerRef.current = window.setTimeout(() => {
      setActive(false)
    }, 3000)
  }

  useEffect(() => {
    const t = window.setTimeout(() => ping(), 120)

    const onMove = () => ping()
    const onScroll = () => ping()
    const onTouch = () => ping()

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("touchstart", onTouch, { passive: true })

    return () => {
      window.clearTimeout(t)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("touchstart", onTouch)
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setActive(true)
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
    } else {
      ping()
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <section className="relative h-[72vh] min-h-[520px] w-full overflow-hidden border-b border-white/10">
      {/* 背景 */}
      <div className="absolute inset-0">
        <Image
          src={bgSrc}
          alt=""
          fill
          priority
          className="object-cover hero-kenburns"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/10" />
      </div>

      {/* テキスト */}
      <div className="relative z-10 h-full px-10 md:px-12">
        <div className="h-full flex flex-col justify-center max-w-3xl">
          {/* ラベル */}
          <div
            className={[
              "text-xs tracking-[0.45em] text-white/60",
              "transition-all duration-700 ease-out",
              active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            ].join(" ")}
          >
            PHOTO LOG
          </div>

          {/* タイトル */}
          <h1
            className={[
              "mt-4 text-3xl md:text-5xl font-light tracking-[0.25em] text-white/90",
              "transition-all duration-1500 ease-out delay-150",
              active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
            ].join(" ")}
          >
            {title}
          </h1>

          {/* サブ */}
          <p
            className={[
              "mt-5 text-sm md:text-base tracking-wider text-white/55",
              "transition-all duration-1500 ease-out delay-300",
              active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
            ].join(" ")}
          >
            {subtitle}
          </p>

          {/* CTA */}
          <div
            className={[
              "mt-10 flex items-center gap-4",
              "transition-all duration-1500 ease-out delay-[450ms]",
              active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
            ].join(" ")}
          >
            <a
              href={ctaHref}
              className="inline-flex items-center gap-3 rounded-full border border-white/20 px-5 py-3 text-xs tracking-[0.35em] text-white/75 hover:text-white hover:border-white/35 hover:bg-white/5 transition"
            >
              VIEW WORK <span className="opacity-70">↓</span>
            </a>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 text-xs tracking-[0.35em] text-white/55 hover:text-white transition"
            >
              ABOUT <span className="opacity-70">ⓘ</span>
            </button>
          </div>
        </div>

        {/* 右下 */}
        <div className="absolute bottom-6 right-8 md:right-12 text-[10px] tracking-[0.35em] text-white/35">
          SCROLL
        </div>
      </div>

      {/* ABOUT */}
      {open && (
        <div
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute left-1/2 top-[62%] w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-neutral-950/90 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs tracking-[0.35em] text-white/55">
                  ABOUT
                </div>
                <div className="mt-1 text-sm tracking-wider text-white/80">
                  Minimal notes.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs tracking-widest text-white/80 hover:bg-black/50 hover:text-white transition"
              >
                CLOSE
              </button>
            </div>

            <div className="mt-6 grid gap-4 text-sm text-white/75">
              <div className="flex items-baseline justify-between gap-6 border-b border-white/10 pb-3">
                <span className="text-xs tracking-[0.35em] text-white/45">
                  CAMERA
                </span>
                <span className="tracking-wider">Nikon Zf</span>
              </div>

              <div className="flex items-baseline justify-between gap-6">
                <span className="text-xs tracking-[0.35em] text-white/45">
                  FOCUS
                </span>
                <span className="tracking-wider">Street / Night / Nature</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}