/**
 * scripts/sync-meta.mjs
 *
 * 使い方: node scripts/sync-meta.mjs
 *
 * public/photos/ 以下の画像を走査し、
 * - EXIFから撮影日(takenAt)を読み取る
 * - sharpで実際の画像サイズ(width/height)を取得
 * data/photo-meta.json に書き込む。
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import exifr from "exifr"
import sharp from "sharp"

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

const meta = fs.existsSync(META_PATH)
  ? JSON.parse(fs.readFileSync(META_PATH, "utf-8") || "{}")
  : {}

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
    const nfcSrc = src.normalize("NFC")
    const existing = meta[nfcSrc] ?? {}

    if (existing.takenAt && existing.width && existing.height) {
      skipped++
      continue
    }

    const filePath = path.join(dirPath, file)
    let takenAt = existing.takenAt
    let width = existing.width
    let height = existing.height

    // takenAt: EXIFから取得
    if (!takenAt) {
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
    }

    // width/height: sharpで実際の画像サイズを取得
    if (!width || !height) {
      try {
        const metadata = await sharp(filePath).metadata()
        width = metadata.width
        height = metadata.height
      } catch {
        // 読めない場合はスキップ
      }
    }

    meta[nfcSrc] = {
      ...existing,
      ...(takenAt ? { takenAt } : {}),
      ...(width ? { width } : {}),
      ...(height ? { height } : {}),
    }

    console.log(`✓ ${nfcSrc} → takenAt:${takenAt ?? "—"} ${width ?? "?"}x${height ?? "?"}`)
    updated++
  }
}

fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2), "utf-8")
console.log(`\n完了: ${updated} 件更新, ${skipped} 件スキップ`)
