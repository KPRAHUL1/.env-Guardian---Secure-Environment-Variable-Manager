import { prisma } from "./prisma"
import crypto from "crypto"

export async function createProject(name: string) {
  const token = crypto.randomBytes(24).toString("base64url") // ~32 chars URL-safe
  return prisma.project.create({
    data: { name, token },
    select: { id: true, name: true, token: true, createdAt: true },
  })
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({ where: { id }, select: { id: true, name: true, token: true } })
}

export async function getProjectByToken(token: string) {
  return prisma.project.findUnique({ where: { token }, select: { id: true, name: true, token: true } })
}
