import { defineConfig, env } from 'prisma/config'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'

if (existsSync('.env')) process.loadEnvFile()

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: 'file:' + resolve(env('DATABASE_URL').replace(/^file:/, '')).replaceAll('\\', '/') }
})
