import { betterAuth } from 'better-auth/minimal'
import { prismaAdapter } from '@better-auth/prisma-adapter'
import { db } from './db.ts'

export function createOwnerAuth(provisioning = false, receiveResetToken?: (token: string) => void) {
  const secret = process.env.BETTER_AUTH_SECRET
  const baseURL = process.env.BETTER_AUTH_URL
  if (!secret || secret.length < 32 || !baseURL) throw new Error('Authentication configuration is incomplete')
  return betterAuth({
    secret,
    baseURL,
    trustedOrigins: [new URL(baseURL).origin],
    database: prismaAdapter(db(), { provider: 'sqlite', transaction: true }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: !provisioning,
      autoSignIn: false,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      ...(receiveResetToken ? { sendResetPassword: async ({ token }: { token: string }) => receiveResetToken(token) } : {})
    },
    session: { expiresIn: 8 * 60 * 60, cookieCache: { enabled: false } },
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 120, customRules: { '/sign-in/email': { window: 60, max: 5 } } },
    advanced: { ipAddress: { ipAddressHeaders: ['x-portfolio-client-ip'] } }
  })
}

let instance: ReturnType<typeof createOwnerAuth> | undefined
export function auth() {
  return instance ??= createOwnerAuth()
}
