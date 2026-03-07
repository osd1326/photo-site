import fs from "fs"
import path from "path"
import InfiniteGallery from "./components/InfiniteGallery"
import CategoryGrid from "./components/CategoryGrid"
import { categories } from "./lib/categories"
import HeroMinimal from "./components/HeroMinimal"

const IGNORE = new Set(["cover_copy.jpg"])

function shuffle<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]
    a[i] = a[j]
    a[j] = tmp
  }
  return a
}

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}.${m}.${day}`
}

type CatStat = { count: number; latest?: string }
type MarqueeItem = { src: string; href: string; alt?: string }

export default function Home() {
  const items: MarqueeItem[] = categories.flatMap((cat) => {
    const dirPath = path.join(process.cwd(), "public/photos", cat.dir)
    if (!fs.existsSync(dirPath)) return []

    const files = fs
      .readdirSync(dirPath)
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .filter((f) => !IGNORE.has(f))
      .filter((f) => !f.toLowerCase().startsWith("cover"))

    return files.map((f) => ({
      src: `/photos/${cat.dir}/${f}`,
      href: `/category/${cat.slug}`,
      alt: (cat as any).label ?? (cat as any).name ?? "",
    }))
  })

  const shuffledItems = shuffle(items)

  const stats: Record<string, CatStat> = Object.fromEntries(
    categories.map((cat) => {
      const dirPath = path.join(process.cwd(), "public/photos", cat.dir)
      if (!fs.existsSync(dirPath)) return [cat.slug, { count: 0 }]

      const files = fs
        .readdirSync(dirPath)
        .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .filter((f) => !IGNORE.has(f))
        .filter((f) => !f.toLowerCase().startsWith("cover"))

      let latestMs = -1
      for (const f of files) {
        const st = fs.statSync(path.join(dirPath, f))
        if (st.mtimeMs > latestMs) latestMs = st.mtimeMs
      }

      return [
        cat.slug,
        {
          count: files.length,
          latest: latestMs > 0 ? formatDate(new Date(latestMs)) : undefined,
        },
      ]
    })
  )

  return (
    <main className="bg-neutral-950 text-neutral-100">
<HeroMinimal
  bgSrc="/photos/profile.jpg"
  title="Quiet moments"
  subtitle="by Manami Osada"
  ctaHref="#categories"
/>
      {/* 速度は seconds で調整（大きいほどゆっくり） */}
      <InfiniteGallery items={shuffledItems} speedPxPerSec={80} />

<section className="px-12 pt-14 pb-10">
  <h1 className="text-3xl md:text-4xl font-light tracking-[0.35em]">
    PHOTO LOG
  </h1>

  <p className="mt-4 text-sm md:text-base text-white/60 tracking-wider">
    Street / Nature / Night - captured quietly, archived carefully.
  </p>

  {/* 👇 ここを追加 */}
  <div className="mt-10 flex items-center gap-6 text-xs tracking-widest text-white/70">
    <a
      href="#categories"
      className="hover:text-white transition"
    >
      BROWSE BY CATEGORY ↓
    </a>
  </div>
</section>

      <CategoryGrid stats={stats} />

      <footer className="px-12 pb-16 pt-6 text-xs tracking-widest text-white/45">
        <div>Copyright {new Date().getFullYear()} Manami Osada</div>
        <div className="mt-2">Shot on weekends. Built with care.</div>
      </footer>
    </main>
  )
}