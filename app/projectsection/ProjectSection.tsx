"use client"

import { useState } from "react"
import ProjectCreator from "@/components/project-creator"
import SecretsManager from "@/components/secrets-manager"

type Project = { id: string; name: string; token: string }

export default function ProjectsSection() {
  const [createdProject, setCreatedProject] = useState<Project | null>(null)

  return (
    <div className="grid gap-8">
      <ProjectCreator
        onCreated={(p) => {
          setCreatedProject(p)
        }}
      />
      <SecretsManager initialProject={createdProject ?? undefined} />
    </div>
  )
}
