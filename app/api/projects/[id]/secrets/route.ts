import { type NextRequest, NextResponse } from "next/server"
import { listSecretsDecrypted, upsertSecret } from "@/lib/secrets"
import { getProjectById } from "@/lib/projects"

type Params = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const project = await getProjectById(params.id)
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const secrets = await listSecretsDecrypted(project.id)
    return NextResponse.json({ project, secrets })
  } catch {
    return NextResponse.json({ error: "Failed to list secrets" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const project = await getProjectById(params.id)
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const { key, value } = await req.json()
    if (!key || typeof key !== "string" || !value || typeof value !== "string") {
      return NextResponse.json({ error: "Invalid key/value" }, { status: 400 })
    }
    const res = await upsertSecret(project.id, key.trim(), value)
    return NextResponse.json(res, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to upsert secret" }, { status: 500 })
  }
}
