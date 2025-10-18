import { type NextRequest, NextResponse } from "next/server"
import { createProject } from "@/lib/projects"

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json()
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 })
    }
    const project = await createProject(name.trim())
    return NextResponse.json(project, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
