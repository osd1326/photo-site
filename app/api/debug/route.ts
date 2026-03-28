import fs from "fs"
import path from "path"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const PHOTOS_DIR = path.join(process.cwd(), "public/photos")
  const result: Record<string, string[]> = {}

  const dirs = fs.readdirSync(PHOTOS_DIR).filter((d) =>
    fs.statSync(path.join(PHOTOS_DIR, d)).isDirectory()
  )

  for (const dir of dirs) {
    const files = fs.readdirSync(path.join(PHOTOS_DIR, dir))
    result[dir] = files
  }

  return Response.json(result)
}
