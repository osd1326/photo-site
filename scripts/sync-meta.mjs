/**
 * scripts/sync-meta.mjs
 *
 * 使い方: node scripts/sync-meta.mjs
 *
 * public/photos/ 以下の画像を走査し、EXIFから撮影日(takenAt)を読み取って
 * data/photo-meta.json に書き込む。
 * - すでに takenAt が記録されている写真はスキップ（上書きしない）
 * - location など既存フィールドはそのまま保持
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import exifr from "exifr"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const PHOTOS_DIR = path.join(ROOT, "public", "photos")
const META_PATH = path.join(ROOT, "data", "photo-meta.json")

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}.${m}.${day}`
}

// 既存のメタを読み込む
const meta = fs.existsSync(META_PATH)
  ? JSON.parse(fs.readFileSync(META_PATH, "utf-8") || "{}")
  : {}

// public/photos/ 直下のディレクトリを走査
const dirs = fs.readdirSync(PHOTOS_DIR).filter((d) => {
  return fs.statSync(path.join(PHOTOS_DIR, d)).isDirectory()
})

let updated = 0
let skipped = 0

for (const dir of dirs) {
  const dirPath = path.join(PHOTOS_DIR, dir)
  const files = fs
    .readdirSync(dirPath)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))

  for (const file of files) {
    const src = `/photos/${dir}/${file}`
    const existing = meta[src.normalize("NFC")] ?? {}

    // takenAt がすでにあればスキップ
    if (existing.takenAt) {
      skipped++
      continue
    }

    const filePath = path.join(dirPath, file)
    let takenAt

    try {
      const buffer = fs.readFileSync(filePath)
      const exif = await exifr.parse(buffer)
      const raw =
        exif?.DateTimeOriginal ||
        exif?.CreateDate ||
        exif?.DateTimeDigitized ||
        exif?.ModifyDate

      if (raw) {
        const d = raw instanceof Date ? raw : new Date(raw)
        if (!Number.isNaN(d.getTime())) takenAt = formatDate(d)
      }
    } catch {
      // EXIFが読めない場合はスキップ
    }

    const nfcSrc = src.normalize("NFC")
    meta[nfcSrc] = { ...existing, ...(takenAt ? { takenAt } : {}) }
    if (takenAt) {
      console.log(`✓ ${nfcSrc} → ${takenAt}`)
      updated++
    } else {
      console.log(`– ${nfcSrc} → EXIF not found`)
    }
  }
}

// 書き戻す
fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2), "utf-8")
console.log(`\n完了: ${updated} 件更新, ${skipped} 件スキップ`)
