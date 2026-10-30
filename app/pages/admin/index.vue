<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'owner' })
const { data, error, refresh } = await useFetch<{ data: { projects: number, drafts: number, experiences: number, skills: number, media: number } }>('/api/admin/overview')
const counts = computed(() => data.value?.data)
const cards = computed(() => [
  { label: 'Proyek', value: counts.value?.projects ?? 0, to: '/admin/projects', icon: 'i-lucide-folder' },
  { label: 'Draft proyek', value: counts.value?.drafts ?? 0, to: '/admin/projects', icon: 'i-lucide-file-pen' },
  { label: 'Pengalaman', value: counts.value?.experiences ?? 0, to: '/admin/experiences', icon: 'i-lucide-briefcase' },
  { label: 'Skill', value: counts.value?.skills ?? 0, to: '/admin/skills', icon: 'i-lucide-code-xml' }
])
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <p class="mb-3 text-xs tracking-[2px] text-accent uppercase">
      Dashboard
    </p>
    <h1 class="text-3xl font-bold sm:text-4xl">
      Karya Anda, selalu terbarui.
    </h1>
    <p class="mt-4 max-w-xl text-sm leading-relaxed text-muted">
      Siapkan konten dalam dua bahasa, periksa kelengkapannya, kemudian publikasikan saat siap.
    </p>
    <div
      v-if="error"
      role="alert"
      class="mt-6 rounded-lg border border-accent/30 p-5"
    >
      Data belum dapat dimuat. <button
        class="text-accent"
        @click="refresh()"
      >
        Coba lagi
      </button>
    </div>
    <div class="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <NuxtLink
        v-for="card in cards"
        :key="card.label"
        :to="card.to"
        class="rounded-xl border border-line bg-surface p-6 transition-transform hover:-translate-y-1"
      >
        <UIcon
          :name="card.icon"
          class="size-6 text-accent"
        /><p class="mt-5 text-4xl font-bold">{{ card.value }}</p><h2 class="mt-2 text-sm text-muted">{{ card.label }}</h2>
      </NuxtLink>
    </div>
    <section class="mt-9 rounded-xl border border-line bg-surface p-6 sm:p-8">
      <h2 class="text-xl font-semibold">
        Mulai dari profil Anda
      </h2>
      <p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Lengkapi profil, kontak, gambar, dan CV untuk kedua bahasa. Konten draft hanya terlihat di dashboard. Konten yang telah dipublikasikan perlu di-unpublish sebelum diedit.
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <UButton to="/admin/profile">
          Edit profil
        </UButton><UButton
          to="/admin/projects"
          color="neutral"
          variant="outline"
        >
          Kelola proyek
        </UButton><UButton
          to="/admin/resume"
          color="neutral"
          variant="outline"
        >
          Kelola CV
        </UButton>
      </div>
    </section>
  </div>
</template>
