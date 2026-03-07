"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Lightbox from "../../components/Lightbox"

type Photo = {
  src: string
  takenAt?: string
  location?: string
}

type SortKey = "new" | "old"

type Props = {
  photos: Photo[]
  prevHref: string
  prevLabel: string
  nextHref: string
  nextLabel: string
  sort: SortKey
  page: number
  totalPages: number
  perPage: number
  total: number
}

export default function Gallery({
  photos,
  prevHref,
  prevLabel,
  nextHref,
  nextLabel,
  sort,
  page,
  totalPages,
  perPage,
  total,
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const open = (index: number) => setActiveIndex(index)
  const close = () => setActiveIndex(null)

  const prev = () => {
    if (activeIndex === null) return
    setActiveIndex((activeIndex - 1 + photos.length) % photos.length)
  }
  const next = () => {
    if (activeIndex === null) return
    setActiveIndex((activeIndex + 1) % photos.length)
  }

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const goto = (nextSort: SortKey, nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", nextSort)
    params.set("page", String(nextPage))
    router.push(`${pathname}?${params.toString()}`)
  }

  const pages = useMemo(() => {
    const maxButtons = 7
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const left = Math.max(1, page - 2)
    const right = Math.min(totalPages, page + 2)
    const list = [1]
    if (left > 2) list.push(-1)
    for (let p = left; p <= right; p++) {
      if (p !== 1 && p !== totalPages) list.push(p)
    }
    if (right < totalPages - 1) list.push(-1)
    list.push(totalPages)
    return list
  }, [page, totalPages])
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-12 py-16">
      <header className="mb-10 flex items-end justify-between gap-6">
        <div className="flex items-center gap-3 text-xs tracking-widest text-white/60">
          <span className="hidden sm:inline">SORT</span>
          <select
            value={sort}
            onChange={(e) => goto(e.target.value as SortKey, 1)}
            className="bg-transparent border border-white/15 rounded-full px-3 py-2 text-white/80 focus:outline-none"
          >
            <option value="new">新しい順</option>
            <option value="old">古い順</option>
          </select>
        </div>
      </header>

      <div className="mb-8 text-xs tracking-widest text-white/50">
        {total} photos · page {page} / {totalPages} · {perPage}/page
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            onClick={() => open(i)}
            className="relative aspect-[3/2] overflow-hidden rounded-xl group"
            aria-label="Open photo"
          >
            <Image
              src={photo.src}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </section>

      <div className="mt-14 flex items-center justify-center gap-2 text-xs tracking-widest text-white/70">
        <button
          onClick={() => goto(sort, Math.max(1, page - 1))}
          disabled={page <= 1}
          className="px-3 py-2 rounded-full border border-white/15 disabled:opacity-30 hover:bg-white/5 transition"
        >
          ←
        </button>

        {pages.map((p, idx) =>
          p === -1 ? (
            <span key={`dots-${idx}`} className="px-2 text-white/40">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => goto(sort, p)}
              className={`px-3 py-2 rounded-full border border-white/15 hover:bg-white/5 transition ${p === page ? "bg-white/10 text-white" : ""
                }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => goto(sort, Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="px-3 py-2 rounded-full border border-white/15 disabled:opacity-30 hover:bg-white/5 transition"
        >
          →
        </button>
      </div>

      <nav className="mt-16 flex items-center justify-between text-sm tracking-widest text-white/70">
        <Link href={prevHref} className="hover:text-white transition">
          ← {prevLabel}
        </Link>
        <Link href="/" className="hover:text-white transition">
          HOME
        </Link>
        <Link href={nextHref} className="hover:text-white transition">
          {nextLabel} →
        </Link>
      </nav>

      {activeIndex !== null && photos[activeIndex] && (
        <Lightbox
          src={photos[activeIndex].src}
          takenAt={photos[activeIndex].takenAt}
          location={photos[activeIndex].location}
          onSaveMeta={async (next) => {
            const res = await fetch("/api/meta/update", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ src: photos[activeIndex].src, location: next.location }),
            })
            console.log("meta update:", res.status, await res.json())
            router.refresh()
          }}
          onClose={close}
          onPrev={prev}
          onNext={next}
          index={activeIndex}
          total={photos.length}
        />
      )}
    </main>
  )
}