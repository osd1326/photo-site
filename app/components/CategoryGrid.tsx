import Image from "next/image"
import Link from "next/link"
import { categories } from "../lib/categories"

type CatStat = { count: number; latest?: string }

export default function CategoryGrid({
  stats,
  coverSrcs,
}: {
  stats?: Record<string, CatStat>
  coverSrcs?: Record<string, string>
}) {
  return (
    <section
      id="categories"
      className="px-12 pb-32 grid grid-cols-1 md:grid-cols-3 gap-12"
    >
      {categories.map((cat) => {
        const s = stats?.[cat.slug]
        const coverSrc = coverSrcs?.[cat.slug] ?? `/photos/${cat.dir}/cover.jpg`
        return (
          <Link key={cat.slug} href={`/category/${cat.slug}`} className="group">
            <div className="relative w-full aspect-[2/1] overflow-hidden rounded-3xl shadow-lg border border-white/5">
              <Image
                src={coverSrc}
                alt={cat.label}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/15 transition" />

              <div className="absolute inset-0 flex flex-col justify-between p-6">
                <div>
                  <h2 className="text-2xl tracking-widest">{cat.label}</h2>
                  <div className="mt-2 text-xs tracking-widest text-white/65">
                    {typeof s?.count === "number" ? `${s.count} PHOTOS` : "—"}
                    {s?.latest ? ` · LATEST ${s.latest}` : ""}
                  </div>
                </div>

                <div className="self-end text-xs tracking-widest text-white/60 group-hover:text-white transition">
                  VIEW →
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </section>
  )
}
