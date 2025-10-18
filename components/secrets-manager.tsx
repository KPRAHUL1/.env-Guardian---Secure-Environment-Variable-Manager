"use client"

import type React from "react"

import useSWR from "swr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Project = { id: string; name: string; token: string }
type SecretPair = { key: string; value: string }

const fetcher = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(r)))

export default function SecretsManager({ initialProject }: { initialProject?: Project }) {
  const [projectId, setProjectId] = useState(initialProject?.id ?? "")
  const [keyName, setKeyName] = useState("")
  const [value, setValue] = useState("")
  const [justCreated, setJustCreated] = useState<Project | null>(initialProject ?? null)

  const { data, isLoading, mutate, error } = useSWR<{ project: Project; secrets: SecretPair[] }>(
    projectId ? `/api/projects/${projectId}/secrets` : null,
    fetcher,
  )

  async function addSecret(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId) return
    await fetch(`/api/projects/${projectId}/secrets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: keyName, value }),
    })
    setKeyName("")
    setValue("")
    mutate()
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-balance">Manage Secrets</CardTitle>
          <CardDescription>View and add environment variables for your project.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="projectId">Project ID</Label>
            <Input
              id="projectId"
              placeholder="Paste your project ID"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
          </div>

          {justCreated && !projectId && (
            <div className="text-sm">
              <p>
                Recently created: <span className="font-mono">{justCreated.name}</span>
              </p>
              <p className="mt-1">
                Project ID: <span className="font-mono">{justCreated.id}</span>
              </p>
              <p className="mt-1">
                CLI Token: <span className="font-mono">{justCreated.token}</span>
              </p>
            </div>
          )}

          <form onSubmit={addSecret} className="grid gap-3 md:grid-cols-3">
            <div className="grid gap-2 md:col-span-1">
              <Label htmlFor="key">Key</Label>
              <Input id="key" placeholder="DATABASE_URL" value={keyName} onChange={(e) => setKeyName(e.target.value)} />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="value">Value</Label>
              <Input id="value" placeholder="postgres://..." value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" disabled={!projectId || !keyName || !value}>
                Add / Update Secret
              </Button>
            </div>
          </form>

          <div className="grid gap-2">
            <Label>CLI usage</Label>
            <code className="text-sm font-mono break-all">
              {"node ./scripts/env-guardian-pull.mjs --host "}
              {"{YOUR_DEPLOY_URL}"}
              {" --token "}
              {data?.project?.token ?? "PROJECT_TOKEN"}
              {" --out .env"}
            </code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-balance">Current Secrets</CardTitle>
          <CardDescription>Decrypted for display only; stored encrypted at rest.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-red-600">Failed to load secrets.</p>}
          {isLoading && <p className="text-sm">Loading...</p>}
          {!isLoading && data?.secrets?.length === 0 && <p className="text-sm">No secrets yet.</p>}
          {data?.secrets && data.secrets.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.secrets.map((s) => (
                  <TableRow key={s.key}>
                    <TableCell className="font-medium">{s.key}</TableCell>
                    <TableCell className="font-mono">{s.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
