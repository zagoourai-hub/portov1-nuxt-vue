<script setup lang="ts">
import type { PublicProject } from '~~/shared/publicTypes'

definePageMeta({ validate: route => route.params.locale === 'id' || route.params.locale === 'en' })
const { locale, text } = usePortfolioLocale()
const page = ref(1)
const { data, error } = await useFetch<{ data: PublicProject[], meta: { total: number } }>('/api/public/projects', { query: { locale, page, pageSize: 12 } })
const projects = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.meta.total ?? 0)
watch(locale, () => {
  page.value = 1
})
useSeoMeta({ title: () => text.value.projects + ' — Web Developer', description: () => text.value.projectIntro })
</script>

<template>
  <section class="min-h-[75vh] py-11 sm:py-[55px] lg:py-[76px] mx-auto w-[calc(100%-32px)] max-w-7xl sm:w-[calc(100%-48px)] xl:w-[calc(100%-80px)]">
    <p class="mb-[15px] flex items-center gap-[9px] text-[9px] leading-normal font-bold tracking-[1.3px] text-[#d2d8dc] sm:text-[11px] sm:tracking-[1.8px] [&>span]:pr-0.5 [&>span]:text-[17px] [&>span]:tracking-[-2px] [&>span]:text-accent [&>span]:italic">
      <span>//</span> {{ text.allWork }}
    </p>
    <div class="mb-[45px] flex flex-col items-start justify-between gap-[18px] lg:flex-row lg:items-end lg:gap-10 [&>p]:max-w-[440px] [&>p]:text-[13px]">
      <h1 class="m-0 text-[32px] leading-[1.1] sm:text-[clamp(30px,3.6vw,46px)]">
        {{ text.latest }}
      </h1><p class="text-sm leading-[1.9] text-muted">
        {{ text.projectIntro }}
      </p>
    </div>
    <div class="grid grid-cols-1 gap-[22px] sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-4 xl:gap-6">
      <ProjectCard
        v-for="(project, index) in projects"
        :key="project.slug"
        :project="project"
        :number="(page - 1) * 12 + index + 1"
      />
    </div>
    <p
      v-if="error"
      role="alert"
      class="mt-6 text-sm text-accent"
    >
      {{ locale === 'id' ? 'Proyek belum dapat dimuat. Silakan coba kembali.' : 'Projects could not be loaded. Please try again.' }}
    </p>
    <p
      v-else-if="!projects.length"
      class="mt-6 text-sm text-muted"
    >
      {{ locale === 'id' ? 'Karya baru segera hadir.' : 'New work is coming soon.' }}
    </p>
    <nav
      v-if="total > 12"
      :aria-label="locale === 'id' ? 'Halaman proyek' : 'Project pages'"
      class="mt-8 flex items-center justify-center gap-5"
    >
      <UButton
        :disabled="page === 1"
        color="neutral"
        variant="outline"
        :aria-label="text.previous"
        icon="i-lucide-chevron-left"
        @click="page--"
      /><span class="text-sm text-muted">{{ page }} / {{ Math.ceil(total / 12) }}</span><UButton
        :disabled="page * 12 >= total"
        color="neutral"
        variant="outline"
        :aria-label="text.next"
        icon="i-lucide-chevron-right"
        @click="page++"
      />
    </nav>
  </section>
</template>
