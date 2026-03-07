import type { Metadata } from "next"
import Link from "next/link"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "PHOTO LOG",
  description: "Personal photo archive",
  verification: {
  google: "CkDIm5CEbcrDEfO2EGON2k7MxrJ4Lf_SI_4SctVD1tc",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-neutral-100`}
      >
        {/* ✅ 共通ヘッダー */}
        <header className="px-12 pt-10 pb-6">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Logo */}
            <Link
              href="/"
              className="
                inline-block
                text-sm
                tracking-[0.45em]
                text-white/70
                hover:text-white
                transition
              "
            >
              PHOTO LOG
            </Link>

            {/* Right: Nav */}
            <nav className="flex items-center gap-6 text-xs tracking-widest text-white/60">
              <Link href="/" className="hover:text-white transition">
                HOME
              </Link>
              <Link href="/profile" className="hover:text-white transition">
                PROFILE
              </Link>
            </nav>
          </div>
        </header>

        {/* 各ページ */}
        {children}
        <Analytics />
      </body>
    </html>
  )
}