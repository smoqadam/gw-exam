import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(_req: Request, { params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params
  const filePath = path.join(process.cwd(), "data", `${examId}.json`)
  try {
    const content = fs.readFileSync(filePath, "utf-8")
    return new NextResponse(content, {
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
