export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

import fs from "fs"
import path from "path"
import type { Metadata } from "next"
import { categories } from "../../lib/categories"
import Gallery from "./Gallery"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = categories.find((c) => c.slug === slug)
  if (!category) return {}
  return {
    title: category.label,
  }
}

type Photo = {
  src: string
  takenAt?: string
  location?: string 
}

type SortKey = "new" | "old"

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ sort?: string; page?: string }>
}) {
  const { slug } = await params
  const sp = (await searchParams) ?? {}
  const sort: SortKey = sp.sort === "old" ? "old" : "new"
  const page = Math.max(1, Number(sp.page ?? 1) || 1)

  const category = categories.find((c) => c.slug === slug)
  if (!category) return null

  const dirPath = path.join(process.cwd(), "public/photos", category.dir)

  const currentIndex = categories.findIndex((c) => c.slug === slug)
  const prevCat = categories[(currentIndex - 1 + categories.length) % categories.length]
  const nextCat = categories[(currentIndex + 1) % categories.length]

  const META_PATH = path.join(process.cwd(), "data", "photo-meta.json")
  const meta: Record<string, { takenAt?: string; location?: string }> =
    fs.existsSync(META_PATH)
      ? JSON.parse(fs.readFileSync(META_PATH, "utf-8") || "{}")
      : {}

  const files = fs.existsSync(dirPath)
    ? fs
        .readdirSync(dirPath)
        .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .filter((f) => f !== "cover.jpg")
    : []

  const allPhotos: Photo[] = files.map((f) => {
    const decodedF = decodeURIComponent(f)
    const decodedDir = decodeURIComponent(category.dir)
    const src = `/photos/${decodedDir}/${decodedF}`
    const entry = meta[src] ?? {}
    return {
      src,
      takenAt: entry.takenAt,
      location: entry.location,
    }
  })

  const sorted = [...allPhotos].sort((a, b) => {
    if (!a.takenAt && !b.takenAt) return 0
    if (!a.takenAt) return 1
    if (!b.takenAt) return -1
    return sort === "new"
      ? b.takenAt.localeCompare(a.takenAt)
      : a.takenAt.localeCompare(b.takenAt)
  })

  const PER_PAGE = 12
  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PER_PAGE
  const pagePhotos = sorted.slice(start, start + PER_PAGE)

  return (
    <Gallery
      photos={pagePhotos}
      categoryLabel={category.label}
      prevHref={`/category/${prevCat.slug}`}
      prevLabel={prevCat.label}
      nextHref={`/category/${nextCat.slug}`}
      nextLabel={nextCat.label}
      sort={sort}
      page={safePage}
      totalPages={totalPages}
      perPage={PER_PAGE}
      total={total}
    />
  )
}