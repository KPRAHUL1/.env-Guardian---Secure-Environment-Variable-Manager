// Usage: node ./scripts/env-guardian-pull.mjs --host https://your-app.vercel.app --token PROJECT_TOKEN --out .env

import fs from 'node:fs'
import path from 'node:path'

function parseArgs(argv) {
  const args = {}
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true
      args[key] = val
    }
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv)
  const host = args.host
  const token = args.token
  const outFile = args.out || '.env'

  if (!host || !token) {
    console.error('[env-guardian] Missing required args. Example:')
    console.error('  node ./scripts/env-guardian-pull.mjs --host https://your-app.vercel.app --token PROJECT_TOKEN --out .env')
    process.exit(1)
  }

  const url = `${host.replace(/\/+$/, '')}/api/cli/pull?token=${encodeURIComponent(token)}`
  const res = await fetch(url, { method: 'GET', headers: { 'Cache-Control': 'no-store' } })
  if (!res.ok) {
    console.error(`[env-guardian] Failed to pull secrets: HTTP ${res.status}`)
    process.exit(1)
  }
  const text = await res.text()
  const outPath = path.resolve(process.cwd(), outFile)
  fs.writeFileSync(outPath, text, 'utf8')
  console.log(`[env-guardian] Wrote ${outFile} with ${text.trim().split('\n').filter(Boolean).length} entries`)
}

main().catch((err) => {
  console.error('[env-guardian] Unexpected error:', err?.message || err)
  process.exit(1)
})
