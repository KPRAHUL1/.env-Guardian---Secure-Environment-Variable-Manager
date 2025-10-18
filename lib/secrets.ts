import { prisma } from "./prisma"
import { encryptSecret, decryptSecret } from "./crypto"

export type SecretPair = { key: string; value: string }

export async function listSecretsDecrypted(projectId: string): Promise<SecretPair[]> {
  const rows = await prisma.secret.findMany({
    where: { projectId },
    select: { key: true, valueEnc: true },
    orderBy: { key: "asc" },
  })
  return rows.map((r) => ({ key: r.key, value: decryptSecret(r.valueEnc) }))
}

export async function upsertSecret(projectId: string, key: string, value: string) {
  const valueEnc = encryptSecret(value)
  return prisma.secret.upsert({
    where: { project_key_unique: { projectId, key } },
    update: { valueEnc },
    create: { projectId, key, valueEnc },
    select: { id: true, key: true, updatedAt: true },
  })
}
