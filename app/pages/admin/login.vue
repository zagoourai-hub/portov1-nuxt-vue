<script setup lang="ts">
import { authClient } from '~/utils/authClient'

definePageMeta({ layout: false })
useSeoMeta({ title: 'Login pemilik — Portfolio', robots: 'noindex, nofollow' })
const email = ref('')
const password = ref('')
const pending = ref(false)
const error = ref('')

async function login() {
  pending.value = true
  error.value = ''
  try {
    const result = await authClient.signIn.email({ email: email.value, password: password.value, rememberMe: false })
    if (result.error) {
      error.value = 'Login gagal. Periksa email dan password, atau coba kembali sebentar lagi.'
      return
    }
    await $fetch('/api/admin/session')
    password.value = ''
    await navigateTo('/admin')
  } catch {
    error.value = 'Akun tidak memiliki akses atau layanan sedang tidak tersedia.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-page px-5 text-ink">
    <div class="w-full max-w-sm rounded-2xl border border-line bg-surface p-8">
      <UIcon
        name="i-lucide-code-xml"
        class="mb-7 size-10 text-accent"
      />
      <p class="mb-3 text-[10px] font-bold tracking-[2px] text-accent uppercase">
        Portfolio / pemilik
      </p>
      <h1 class="text-3xl font-bold">
        Selamat kembali.
      </h1>
      <p class="mt-3 text-sm leading-relaxed text-muted">
        Masuk untuk memperbarui karya dan cerita profesional Anda.
      </p>
      <form
        class="mt-8 grid gap-5"
        @submit.prevent="login"
      >
        <UFormField
          label="Email"
          name="email"
          required
        >
          <UInput
            v-model="email"
            type="email"
            autocomplete="username"
            required
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Password"
          name="password"
          required
        >
          <UInput
            v-model="password"
            type="password"
            autocomplete="current-password"
            minlength="12"
            maxlength="128"
            required
            class="w-full"
          />
        </UFormField>
        <p
          v-if="error"
          role="alert"
          class="text-sm text-accent"
        >
          {{ error }}
        </p>
        <UButton
          type="submit"
          :loading="pending"
          block
          size="lg"
        >
          Masuk dashboard <UIcon name="i-lucide-arrow-right" />
        </UButton>
      </form>
      <NuxtLink
        to="/id"
        class="mt-7 block text-xs text-muted hover:text-white"
      >← Kembali ke portfolio</NuxtLink>
    </div>
  </main>
</template>
