"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type CreatedProject = { id: string; name: string; token: string }

export default function ProjectCreator({
  onCreated,
  className,
}: {
  onCreated: (p: CreatedProject) => void
  className?: string
}) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error("Failed")
      const data = (await res.json()) as CreatedProject
      onCreated(data)
      setName("")
    } catch {
      setError("Could not create project")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-balance">Create a Project</CardTitle>
        <CardDescription>Add a new environment-managed project.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreate} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Project name</Label>
            <Input
              id="name"
              placeholder="MyWebApp-Dev"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
