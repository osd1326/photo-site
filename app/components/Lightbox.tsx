"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"

type Props = {
  src: string
  takenAt?: string
  location?: string
  onSaveMeta?: (next: { location?: string }) => Promise<void> | void
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  index: number
  total: number
}

export default function Lightbox({
  src,
  takenAt,
  location,
  onSaveMeta,
  onClose,
  onPrev,
  onNext,
  index,
  total,
}: Props) {
  const [showUI, setShowUI] = useState(true)
  const hideTimer = useRef<NodeJS.Timeout | null>(null)

  const [zoomed, setZoomed] = useState(false)

  // ✅ パン用
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isPanningRef = useRef(false)
  const startRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const movedRef = useRef(false)

  // ✅ スワイプ用（ズームしてない時だけ prev/next）
  const swipeRef = useRef({
    x: 0,
    y: 0,
    fired: false,
    pointerType: "mouse" as string,
  })

  // ✅ ⓘ 情報パネル
  const [infoOpen, setInfoOpen] = useState(false)

  // ✅ 編集（LOCATION）
  const [editing, setEditing] = useState<null | "location">(null)
  const [draftLocation, setDraftLocation] = useState(location ?? "")
  const [saving, setSaving] = useState(false)
  const editEnabled = process.env.NEXT_PUBLIC_EDIT_ENABLED === "true"
  const activateUI = () => {
    setShowUI(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowUI(false), 1500)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // input編集中はショートカット無効
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      activateUI()
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") onPrev()
      if (e.key === "ArrowRight") onNext()
      if (e.key.toLowerCase() === "z") setZoomed((v) => !v)
      if (e.key.toLowerCase() === "i") setInfoOpen((v) => !v)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose, onPrev, onNext])

  // スクロール固定
  useEffect(() => {
    const prevBody = document.body.style.overflow
    const prevHtml = document.documentElement.style.overflow
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevBody
      document.documentElement.style.overflow = prevHtml
    }
  }, [])

  // 画像切替でリセット
  useEffect(() => {
    setZoomed(false)
    setPan({ x: 0, y: 0 })
    setInfoOpen(false)

    setEditing(null)
    setDraftLocation(location ?? "")
  }, [src, location])

  // location prop が更新されたら draft を同期
  useEffect(() => {
    if (!editing) {
      setDraftLocation(location ?? "")
    }
  }, [location])

  useEffect(() => {
    activateUI()
  }, [])

  useEffect(() => {
    if (!zoomed) setPan({ x: 0, y: 0 })
  }, [zoomed])

  const onPhotoClick = () => {
    if (movedRef.current) return
    setZoomed((v) => !v)
  }

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    activateUI()

    swipeRef.current = {
      x: e.clientX,
      y: e.clientY,
      fired: false,
      pointerType: e.pointerType,
    }

    if (!zoomed) return

    isPanningRef.current = true
    movedRef.current = false

    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    }

      ; (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    activateUI()

    // ✅ ズームしてない時：左右スワイプで prev/next（touch のみ）
    if (!zoomed) {
      if (swipeRef.current.fired) return
      if (swipeRef.current.pointerType !== "touch") return

      const dx = e.clientX - swipeRef.current.x
      const dy = e.clientY - swipeRef.current.y

      const NOISE = 8
      if (Math.abs(dx) < NOISE && Math.abs(dy) < NOISE) return

      const THRESHOLD = 26
      const isHorizontal = Math.abs(dx) > Math.abs(dy) * 1.05

      if (isHorizontal && Math.abs(dx) > THRESHOLD) {
        swipeRef.current.fired = true
        movedRef.current = true
        if (dx < 0) onNext()
        else onPrev()
      }
      return
    }

    // ✅ ズーム中：パン
    if (!isPanningRef.current) return

    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y

    if (!movedRef.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      movedRef.current = true
    }

    const LIMIT_X = window.innerWidth * 0.35
    const LIMIT_Y = window.innerHeight * 0.35

    const nx = Math.max(-LIMIT_X, Math.min(LIMIT_X, startRef.current.panX + dx))
    const ny = Math.max(-LIMIT_Y, Math.min(LIMIT_Y, startRef.current.panY + dy))

    setPan({ x: nx, y: ny })
  }

  const onPointerUpOrCancel = () => {
    isPanningRef.current = false
    window.setTimeout(() => {
      movedRef.current = false
      swipeRef.current.fired = false
    }, 0)
  }

  const transform = useMemo(() => {
    const scale = zoomed ? 2 : 1
    const tx = zoomed ? pan.x : 0
    const ty = zoomed ? pan.y : 0
    return `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`
  }, [zoomed, pan.x, pan.y])

  const saveMeta = async (next: { location?: string }) => {
    if (!onSaveMeta) return
    if (!editEnabled) return

    setSaving(true)
    try {
      await onSaveMeta({ location: next.location })
      setEditing(null)
      setInfoOpen(false)
    } finally {
      setSaving(false)
    }
  }
  // ✅ 重要：ⓘが開いてる/編集中は、写真レイヤーがクリックを奪わないようにする
  const photoLayerPointerEvents =
    infoOpen || editing ? "pointer-events-none" : "pointer-events-auto"

  return (
    <div className="fixed inset-0 z-50 bg-black/85" onClick={onClose} onMouseMove={activateUI}>
      {/* 画像 */}
      <div className="absolute inset-0 flex items-center justify-center px-6 pb-10 pt-24 sm:p-10">
        <div className="relative w-[90vw] h-[90vh] max-w-6xl" onClick={(e) => e.stopPropagation()}>
          <div
            className={`absolute inset-0 z-10 ${photoLayerPointerEvents} ${zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
              }`}
            onClick={onPhotoClick}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUpOrCancel}
            onPointerCancel={onPointerUpOrCancel}
          />

          <div className="relative z-0 w-full h-full transition-transform duration-300" style={{ transform, transformOrigin: "center" }}>
            <Image src={src} alt="" fill className="object-contain rounded-xl select-none" draggable={false} />
          </div>
        </div>
      </div>

      {/* UI群 */}
      <div
        className={`
          pointer-events-none fixed inset-0 z-[60]
          transition-opacity duration-300
          ${showUI ? "opacity-100" : "opacity-0"}
        `}
      >
        {/* Close */}
        <div className="fixed top-6 right-6 z-[80] pointer-events-auto">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="relative touch-manipulation rounded-full border border-white/15 bg-black/50 px-4 py-3 text-xs tracking-widest text-white/90 hover:text-white hover:bg-black/70 transition"
            aria-label="Close"
          >
            CLOSE
          </button>
        </div>

        {/* Prev */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          className="pointer-events-auto fixed left-6 top-1/2 -translate-y-1/2 rounded-full bg-black/50 border border-white/15 px-3 py-2 text-xs tracking-widest text-white/90 hover:text-white hover:bg-black/70 transition"
        >
          ‹
        </button>

        {/* Next */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="pointer-events-auto fixed right-6 top-1/2 -translate-y-1/2 rounded-full bg-black/50 border border-white/15 px-3 py-2 text-xs tracking-widest text-white/90 hover:text-white hover:bg-black/70 transition"
        >
          ›
        </button>

        {/* Counter */}
        <div className="fixed bottom-6 right-6 text-xs tracking-widest text-white/70">
          {index + 1} / {total}
        </div>

        {/* Hint */}
        <div className="fixed bottom-16 left-6 text-[10px] tracking-widest text-white/50">
          Tap photo to {zoomed ? "zoom out" : "zoom in"} · Drag to pan · Swipe to browse · (Z) · (I)
        </div>
      </div>

      {/* ✅ 左下：ⓘ（独立レイヤーで最前面） */}
      <div className="fixed bottom-6 left-6 z-[200] pointer-events-auto">
        <div className="relative">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              setInfoOpen((v) => !v)
            }}
            className="rounded-full border border-white/15 bg-black/40 px-3 py-2 text-[11px] tracking-widest text-white/75 hover:text-white hover:bg-black/60 transition"
            aria-label="Info"
          >
            ⓘ
          </button>

          {/* 情報カード */}
          <div
            className={[
              "absolute bottom-12 left-0 w-[280px] rounded-2xl border border-white/10 bg-neutral-950/90 shadow-2xl backdrop-blur-[2px] p-4",
              "transition-all duration-300 ease-out",
              infoOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
            ].join(" ")}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid gap-4 text-xs text-white/80">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[10px] tracking-[0.35em] text-white/45">DATE</span>
                <span className="tracking-wider">{takenAt ?? "—"}</span>
              </div>

              {/* LOCATION */}
              <div className="grid gap-2">
                {editing !== "location" ? (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] tracking-[0.35em] text-white/45">LOCATION</span>

                    <div className="flex items-center gap-3">
                      <span className="tracking-wider text-right">{location ?? "—"}</span>

                      {editEnabled && (
                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation()
                            setDraftLocation(location ?? "")
                            setEditing("location")
                            setInfoOpen(true)
                          }}
                          className="text-[10px] tracking-[0.35em] text-white/55 hover:text-white/85 transition cursor-pointer"
                        >
                          EDIT
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-[10px] tracking-[0.35em] text-white/45">LOCATION</span>
                      <span className="text-[10px] tracking-[0.35em] text-white/45">
                        {saving ? "SAVING…" : "EDITING"}
                      </span>
                    </div>

                    <div className="grid gap-2">
                      <input
                        value={draftLocation}
                        onChange={(e) => setDraftLocation(e.target.value)}
                        placeholder="e.g. Asakusa, Tokyo"
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white/85 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={saving}
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditing(null)
                            setDraftLocation(location ?? "")
                          }}
                          className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-[10px] tracking-[0.35em] text-white/65 hover:text-white hover:bg-black/45 transition disabled:opacity-40"
                        >
                          CANCEL
                        </button>

                        <button
                          type="button"
                          disabled={saving}
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          onClick={async (e) => {
                            e.stopPropagation()
                            await saveMeta({ location: draftLocation.trim() || undefined })
                            setInfoOpen(false)
                          }}
                          className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] tracking-[0.35em] text-white/80 hover:bg-white/15 hover:text-white transition disabled:opacity-40"
                        >
                          SAVE
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}