import { createRequire } from 'node:module'

const adapterRequire = createRequire(import.meta.resolve('@prisma/adapter-libsql'))
const clientRequire = createRequire(adapterRequire.resolve('@libsql/client'))
const sqliteRequire = createRequire(clientRequire.resolve('libsql'))
const { currentTarget } = sqliteRequire('@neon-rs/load') as { currentTarget: () => string }

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: false
  },

  css: ['~/assets/css/main.css'],

  ui: {
    fonts: false
  },

  runtimeConfig: {
    public: { siteUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000' }
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    rollupConfig: {
      plugins: [{
        name: 'prisma-client-directory',
        transform(code, id) {
          // Nitro's synthetic import.meta URL is not a valid Windows file URL.
          if (!id.replaceAll('\\', '/').endsWith('/server/generated/prisma/client.ts')) return
          const generatedExpression = 'path.dirname(fileURLToPath(import.meta.url))'
          if (!code.includes(generatedExpression)) throw new Error('Prisma client format changed; review Windows bundling compatibility.')
          return code.replace(generatedExpression, 'process.cwd()')
        }
      }]
    },
    externals: {
      // Native bindings are selected dynamically and need explicit tracing in the server bundle.
      traceInclude: [sqliteRequire.resolve('@libsql/' + currentTarget())]
    }
  },

  typescript: {
    strict: true
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
