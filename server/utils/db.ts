import { resolve } from 'node:path'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '../generated/prisma/client.ts'

let client: PrismaClient | undefined

export function db() {
  if (client) return client
  const url = process.env.DATABASE_URL
  if (!url?.startsWith('file:')) throw new Error('DATABASE_URL must use a local SQLite file')
  client = new PrismaClient({ adapter: new PrismaLibSql({ url: 'file:' + resolve(url.slice(5)).replaceAll('\\', '/') }) })
  return client
}
