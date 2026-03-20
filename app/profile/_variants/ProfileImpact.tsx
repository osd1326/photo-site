import Image from "next/image"
import Link from "next/link"

export default function ProfileImpact() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* HERO */}
      <section className="relative h-[72vh] min-h-[520px] overflow-hidden">
        <Image
          src="/photos/profile.jpg"
          alt="Profile hero"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-neutral-950" />

        <div className="relative h-full px-12 pt-16 pb-10 flex items-end">
          <div className="max-w-3xl">
            <div className="text-xs tracking-[0.45em] text-white/70">
              PHOTOGRAPHER
            </div>
            <h1 className="mt-4 text-4xl font-light tracking-[0.22em]">
              MANAMI OSADA
            </h1>
            <p className="mt-6 text-sm md:text-base text-white/70 tracking-wider leading-relaxed">
              Quiet frames. Night air. Street light.
            </p>
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section className="px-12 py-16 max-w-3xl">
        <div className="grid gap-0 divide-y divide-white/10">
          <div className="flex items-baseline justify-between gap-6 py-5">
            <span className="text-xs tracking-[0.45em] text-white/40">FOCUS</span>
            <span className="text-sm tracking-wider text-white/80">Street / Nature / Night</span>
          </div>
          <div className="flex items-baseline justify-between gap-6 py-5">
            <span className="text-xs tracking-[0.45em] text-white/40">GEAR</span>
            <span className="text-sm tracking-wider text-white/80">Nikon Zf</span>
          </div>
          <div className="flex items-baseline justify-between gap-6 py-5">
            <span className="text-xs tracking-[0.45em] text-white/40">BASE</span>
            <span className="text-sm tracking-wider text-white/80">Tokyo, Japan</span>
          </div>
        </div>

        <div className="mt-14 flex items-center gap-4">
          <Link
            href="/#categories"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/30 px-5 py-3 text-xs tracking-widest text-white/85 hover:bg-black/50 hover:text-white transition"
          >
            VIEW CATEGORIES →
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-xs tracking-widest text-white/70 hover:text-white hover:bg-white/5 transition"
          >
            HOME
          </Link>
        </div>
      </section>

      {/* FOOT */}
      <section className="px-12 pb-16">
        <div className="text-xs tracking-widest text-white/30">
          Shot on weekends. Built with care.
        </div>
      </section>
    </main>
  )
}