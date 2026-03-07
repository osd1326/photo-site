import Image from "next/image"

export default function ProfileQuiet() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-12 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl tracking-[0.3em] mb-10">PROFILE</h1>

        <section className="flex flex-col sm:flex-row gap-10 items-start">
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
            <Image src="/profile.jpg" alt="Profile" fill className="object-cover" />
          </div>

          <div className="flex-1">
            <div className="text-sm tracking-[0.25em] text-white/70">
              MANAMI OSADA
            </div>

            <p className="mt-4 text-white/70 leading-relaxed">
              Weekend photographer. I capture quiet moments — street, nature,
              night — and archive them carefully.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs tracking-widest text-white/60">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-white/40 mb-2">FOCUS</div>
                <div>STREET / NATURE / NIGHT</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-white/40 mb-2">GEAR</div>
                <div>Nikon Zf</div>
              </div>
            </div>

            <div className="mt-10 text-xs tracking-widest text-white/50">
              Contact: your@email.com
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}