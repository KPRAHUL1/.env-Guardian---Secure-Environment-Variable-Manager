import { type NextRequest, NextResponse } from "next/server"
import { getProjectByToken } from "@/lib/projects"
import { listSecretsDecrypted } from "@/lib/secrets"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token") || ""
    if (!token) return new NextResponse("Missing token", { status: 400 })

    const project = await getProjectByToken(token)
    if (!project) return new NextResponse("Invalid token", { status: 404 })

    const pairs = await listSecretsDecrypted(project.id)
    const body = pairs.map(({ key, value }) => `${key}=${escapeValue(value)}`).join("\n") + "\n"
    return new NextResponse(body, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    })
  } catch {
    return new NextResponse("Failed to pull secrets", { status: 500 })
  }
}

function escapeValue(val: string) {
  // wrap in quotes if contains spaces or special characters
  if (/[\s#"'`$]/.test(val)) {
    const escaped = val.replace(/"/g, '\\"')
    return `"${escaped}"`
  }
  return val
}
