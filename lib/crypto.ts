import crypto from "crypto"

const VERSION = "v1"

function getMasterKey(): Buffer {
  const raw = process.env.ENV_GUARDIAN_MASTER_KEY
  if (!raw) {
    throw new Error("ENV_GUARDIAN_MASTER_KEY is not set")
  }
  // Try base64, hex, then utf8; ensure 32 bytes for AES-256
  let key: Buffer | null = null
  for (const enc of ["base64", "hex"] as const) {
    try {
      const buf = Buffer.from(raw, enc)
      if (buf.length === 32) {
        key = buf
        break
      }
    } catch {}
  }
  if (!key) {
    const buf = Buffer.from(raw, "utf8")
    if (buf.length === 32) key = buf
  }
  if (!key || key.length !== 32) {
    throw new Error("ENV_GUARDIAN_MASTER_KEY must decode to 32 bytes (use base64/hex or 32-char utf8)")
  }
  return key
}

export function encryptSecret(plaintext: string): string {
  const key = getMasterKey()
  const iv = crypto.randomBytes(12) // recommended size for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [VERSION, iv.toString("base64"), ciphertext.toString("base64"), tag.toString("base64")].join(":")
}

export function decryptSecret(payload: string): string {
  const [version, ivB64, ctB64, tagB64] = payload.split(":")
  if (version !== VERSION) {
    throw new Error(`Unsupported secret payload version: ${version}`)
  }
  const key = getMasterKey()
  const iv = Buffer.from(ivB64, "base64")
  const ciphertext = Buffer.from(ctB64, "base64")
  const tag = Buffer.from(tagB64, "base64")
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
  decipher.setAuthTag(tag)
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return plaintext.toString("utf8")
}
