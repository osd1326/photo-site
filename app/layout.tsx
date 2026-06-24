import type { Metadata } from "next"
import Link from "next/link"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://photo-site-urs8.vercel.app"),
  title: {
    default: "PHOTO LOG",
    template: "%s | PHOTO LOG",
  },
  description: "Personal photo archive",
  verification: {
    google: "CkDIm5CEbcrDEfO2EGON2k7MxrJ4Lf_SI_4SctVD1tc",
  },
  openGraph: {
    title: "PHOTO LOG",
    description: "Personal photo archive",
    url: "https://photo-site-urs8.vercel.app",
    siteName: "PHOTO LOG",
    images: [
      {
        url: "/photos/profile.jpg",
        width: 1200,
        height: 630,
        alt: "PHOTO LOG",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PHOTO LOG",
    description: "Personal photo archive",
    images: ["/photos/profile.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-neutral-100`}
      >
        {/* Header */}
        <header className="px-12 pt-10 pb-6">
          <div className="flex items-center justify-between gap-6">
            <Link
              href="/"
              className="inline-block text-sm tracking-[0.45em] text-white/70 hover:text-white transition"
            >
              PHOTO LOG
            </Link>

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

        {/* Page */}
        {children}

        {/* Vercel Analytics */}
        <Analytics />

        {/* Microsoft Clarity */}
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "wf6ngehb12");
          `}
        </Script>
      </body>
    </html>
  )
}