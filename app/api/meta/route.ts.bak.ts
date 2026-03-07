export const runtime = "nodejs"

import fs from "fs"
import path from "path"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("🟢 ROUTE body =", body)

    const src = String(body?.src ?? "")
    if (!src.startsWith("/photos/")) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid src" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // ✅ patch（undefinedは入れない）
    const patch: { title?: string; tags?: string[]; location?: string } = {}

    console.log("🟢 ROUTE patch =", patch)

    // 「更新したいものだけ」入れる
    if (typeof body.title === "string") patch.title = body.title
    if (Array.isArray(body.tags)) patch.tags = body.tags.filter((x: any) => typeof x === "string")
    if (typeof body.location === "string") patch.location = body.location

    // ✅ 何も更新が無いなら、ファイル触らずに返す（{}が増殖するのを防ぐ）
    if (Object.keys(patch).length === 0) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const dataDir = path.join(process.cwd(), "data")
    const META_PATH = path.join(dataDir, "photo-meta.json")
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

    const meta: Record<string, { title?: string; tags?: string[]; location?: string }> =
      fs.existsSync(META_PATH)
        ? JSON.parse(fs.readFileSync(META_PATH, "utf-8") || "{}")
        : {}

    meta[src] = {
      ...(meta[src] ?? {}),
      ...patch, // ✅ undefinedが混ざらない
    }

    fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2), "utf-8")

    console.log("🟢 API wrote meta:", src, meta[src])

    return new Response(JSON.stringify({ ok: true, meta: meta[src] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message ?? "Unknown" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}