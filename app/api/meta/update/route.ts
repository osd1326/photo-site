export const runtime = "nodejs"

import fs from "fs"
import path from "path"
import { NextResponse } from "next/server"

const META_PATH = path.join(process.cwd(), "data", "photo-meta.json")
const EDIT_ENABLED = process.env.EDIT_ENABLED === "true"

type Meta = Record<string, { title?: string; tags?: string[]; location?: string }>

function readMeta(): Meta {
  if (!fs.existsSync(META_PATH)) return {}
  const raw = fs.readFileSync(META_PATH, "utf-8")
  try {
    return JSON.parse(raw || "{}")
  } catch {
    return {}
  }
}

export async function POST(req: Request) {
  try {
    if (!EDIT_ENABLED) {
      return NextResponse.json(
        { ok: false, error: "Editing disabled" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { src, title, tags, location } = body ?? {}

    if (!src || typeof src !== "string") {
      return NextResponse.json({ error: "src is required" }, { status: 400 })
    }
    if (title !== undefined && typeof title !== "string") {
      return NextResponse.json({ error: "title must be string" }, { status: 400 })
    }
    if (tags !== undefined && !Array.isArray(tags)) {
      return NextResponse.json({ error: "tags must be array" }, { status: 400 })
    }
    if (location !== undefined && typeof location !== "string") {
      return NextResponse.json({ error: "location must be string" }, { status: 400 })
    }

    const meta = readMeta()
    const nfcSrc = src.normalize("NFC")

    meta[nfcSrc] = {
      ...(meta[nfcSrc] ?? {}),
      ...(title !== undefined ? { title } : {}),
      ...(tags !== undefined ? { tags } : {}),
      ...(location !== undefined ? { location } : {}),
    }

    fs.mkdirSync(path.dirname(META_PATH), { recursive: true })
    fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2), "utf-8")

    return NextResponse.json({
      ok: true,
      meta: meta[nfcSrc],
    })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}