<script setup lang="ts">
import { authClient } from '~/utils/authClient'

useSeoMeta({ robots: 'noindex, nofollow', title: 'Dashboard — Portfolio' })
const links = [
  { label: 'Ringkasan', to: '/admin', icon: 'i-lucide-layout-dashboard' },
  { label: 'Profil & kontak', to: '/admin/profile', icon: 'i-lucide-user-round' },
  { label: 'Proyek', to: '/admin/projects', icon: 'i-lucide-folder' },
  { label: 'Pengalaman', to: '/admin/experiences', icon: 'i-lucide-briefcase' },
  { label: 'Skill', to: '/admin/skills', icon: 'i-lucide-code-xml' },
  { label: 'Media', to: '/admin/media', icon: 'i-lucide-image' },
  { label: 'CV bilingual', to: '/admin/resume', icon: 'i-lucide-file-text' }
]
const route = useRoute()
const logoutError = ref('')
async function logout() {
  const result = await authClient.signOut()
  if (result.error) {
    logoutError.value = 'Logout gagal. Coba kembali.'
    return
  }
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-page font-sans text-ink lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
    <aside class="border-b border-line bg-surface p-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:border-b-0 lg:p-7">
      <NuxtLink
        to="/admin"
        class="mb-7 inline-flex items-center gap-3 text-lg font-bold"
      ><UIcon
        name="i-lucide-code-xml"
        class="size-7 text-accent"
      /> Portfolio<span class="text-accent">.</span></NuxtLink>
      <p class="mb-3 text-[10px] font-bold tracking-[2px] text-muted uppercase">
        Ruang pengelolaan
      </p>
      <nav
        aria-label="Navigasi dashboard"
        class="flex flex-wrap gap-2 lg:grid"
      >
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :aria-current="route.path === link.to ? 'page' : undefined"
          :class="route.path === link.to ? 'bg-accent/15 text-accent' : 'text-muted hover:bg-white/5 hover:text-white'"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
        ><UIcon
          :name="link.icon"
          class="size-[18px]"
        />{{ link.label }}</NuxtLink>
      </nav>
      <div class="mt-6 flex items-center gap-3 lg:mt-auto lg:grid">
        <NuxtLink
          to="/id"
          target="_blank"
          class="text-xs text-muted hover:text-white"
        >Lihat website ↗</NuxtLink>
        <button
          class="text-left text-xs text-accent"
          @click="logout"
        >
          Keluar dari akun
        </button>
        <p
          v-if="logoutError"
          role="alert"
          class="text-xs text-accent"
        >
          {{ logoutError }}
        </p>
      </div>
    </aside>
    <main
      id="main-content"
      class="min-w-0 px-5 py-8 sm:p-10 lg:px-12"
    >
      <slot />
    </main>
  </div>
</template>
