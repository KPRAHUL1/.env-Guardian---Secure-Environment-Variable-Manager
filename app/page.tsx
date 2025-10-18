import ProjectSection from "@/app/projectsection/ProjectSection"

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl p-6 md:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-balance">.env Guardian</h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Securely manage and sync your environment variables with your team. Secrets are encrypted at rest, and the CLI
          keeps everyone up-to-date.
        </p>
      </header>

      <ProjectSection />
    </main>
  )
}


