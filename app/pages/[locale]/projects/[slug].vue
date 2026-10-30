<script setup lang="ts">
import type { PublicProject, PublicProjectDetail } from '~~/shared/publicTypes'

definePageMeta({ validate: route => route.params.locale === 'id' || route.params.locale === 'en' })
const route = useRoute()
const { locale, text } = usePortfolioLocale()
const { data, error } = await useFetch<{ data: PublicProjectDetail }>(() => '/api/public/projects/' + route.params.slug, { query: { locale } })
if (error.value) throw createError({ statusCode: error.value.statusCode === 404 ? 404 : 503, statusMessage: error.value.statusCode === 404 ? 'Project not found' : 'Service unavailable' })
const project = computed(() => data.value?.data)
const { data: listing } = await useFetch<{ data: PublicProject[] }>('/api/public/projects', { query: { locale, pageSize: 100 } })
const nextProject = computed(() => {
  const items = listing.value?.data ?? []
  return items.length > 1 ? items[(items.findIndex(item => item.slug === route.params.slug) + 1) % items.length] : undefined
})
const galleryIndex = ref(0)
watch(() => route.params.slug, () => {
  galleryIndex.value = 0
})
useSeoMeta({ title: () => (project.value?.title ?? text.value.notFound) + ' ? Web Developer', description: () => project.value?.summary, ogTitle: () => project.value?.title, ogDescription: () => project.value?.summary, ogImage: () => project.value?.images[0]?.url })
</script>

<template>
  <article
    v-if="project"
    class="pt-[30px] pb-10 sm:pt-11 sm:pb-[65px] mx-auto w-[calc(100%-32px)] max-w-7xl sm:w-[calc(100%-48px)] xl:w-[calc(100%-80px)]"
  >
    <NuxtLink
      :to="'/' + locale + '/projects'"
      class="inline-flex items-center gap-3 font-medium text-[#dde2e5] hover:text-accent [&>.iconify]:text-lg [&>.iconify]:text-accent mb-10 text-[11px]"
    ><UIcon name="i-lucide-arrow-left" />{{ text.backProjects }}</NuxtLink>
    <div class="flex items-start justify-between [&_h1]:text-[43px] sm:[&_h1]:text-[clamp(40px,6vw,76px)]">
      <div>
        <p class="mb-[15px] flex items-center gap-[9px] text-[9px] leading-normal font-bold tracking-[1.3px] text-[#d2d8dc] sm:text-[11px] sm:tracking-[1.8px] [&>span]:pr-0.5 [&>span]:text-[17px] [&>span]:tracking-[-2px] [&>span]:text-accent [&>span]:italic">
          <span>//</span> {{ project.technologies[0] }}
        </p><h1 class="m-0 text-[32px] leading-[1.1] sm:text-[clamp(30px,3.6vw,46px)]">
          {{ project.title }}
        </h1>
      </div><span
        class="pt-[25px] text-[35px] leading-none font-extrabold text-white/15 sm:pt-0 sm:text-[58px]"
        aria-hidden="true"
      >/{{ String((listing?.data.findIndex(item => item.slug === project?.slug) ?? 0) + 1).padStart(2, '0') }}</span>
    </div>
    <p class="mt-5 max-w-[690px] text-[13px] leading-[1.8] text-[#aab7c0] sm:text-base">
      {{ project.summary }}
    </p>
    <div
      class="relative mt-10 overflow-hidden rounded-lg border border-line [&>div:first-child]:h-[280px] sm:[&>div:first-child]:h-[clamp(280px,44vw,540px)]"
      role="group"
      :aria-label="text.gallery"
    >
      <ProjectPreview :image="project.images[galleryIndex] ?? null" />
      <div class="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-white/15 bg-[#080b0ded] p-[3px] sm:bottom-4 sm:gap-4 sm:px-[7px] sm:py-[5px] [&>button]:rounded-full [&>button]:bg-transparent [&>button]:p-1.5 [&>button]:text-white [&>span]:text-[9px] [&>span]:whitespace-nowrap [&>span]:text-[#ccd5dc] sm:[&>span]:text-[11px]">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="outline"
          :aria-label="text.previous"
          :disabled="project.images.length < 2"
          @click="galleryIndex = (galleryIndex + project.images.length - 1) % project.images.length"
        /><span aria-live="polite">{{ String(galleryIndex + 1).padStart(2, '0') }} / {{ String(project.images.length).padStart(2, '0') }}</span><UButton
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="outline"
          :aria-label="text.next"
          :disabled="project.images.length < 2"
          @click="galleryIndex = (galleryIndex + 1) % project.images.length"
        />
      </div>
    </div>
    <div class="grid gap-[30px] py-[35px] sm:grid-cols-[1.7fr_1fr] sm:gap-10 sm:py-[55px] xl:gap-[90px] [&_h2]:mt-2.5 [&_h2]:mb-[18px] [&_h2]:text-[27px] [&_h2]:font-semibold [&_p]:text-[13px] [&_p]:leading-[1.9] [&_p]:text-[#a8b4bc] sm:[&_p]:text-sm [&_h3]:mb-3 [&_h3]:text-[11px] [&_h3]:font-bold [&_h3]:tracking-[1px] [&_h3]:text-[#e7eaed]">
      <div>
        <p class="mb-[15px] flex items-center gap-[9px] text-[9px] leading-normal font-bold tracking-[1.3px] text-[#d2d8dc] sm:text-[11px] sm:tracking-[1.8px] [&>span]:pr-0.5 [&>span]:text-[17px] [&>span]:tracking-[-2px] [&>span]:text-accent [&>span]:italic">
          <span>//</span> {{ text.overview }}
        </p><h2>{{ project.title }}</h2><p>{{ project.summary }}</p><div class="mt-7">
          <h3>{{ text.role }}</h3><p>{{ project.role }}</p>
        </div><div class="mt-7">
          <h3>{{ text.outcome }}</h3><p>{{ project.outcome }}</p>
        </div>
      </div><aside class="border-t border-line pt-[25px] sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8 [&_span]:px-2.5 [&_span]:py-2 [&_span]:text-[11px]">
        <h3>TECH STACK</h3><div class="flex flex-wrap gap-1.5 [&>span]:rounded-sm [&>span]:border [&>span]:border-white/2 [&>span]:bg-[#1a2327] [&>span]:px-[7px] [&>span]:py-1.5 [&>span]:text-[9px] [&>span]:text-[#c8d0d5]">
          <span
            v-for="technology in project.technologies"
            :key="technology"
          >{{ technology }}</span>
        </div><NuxtLink
          :to="'/' + locale + '#contact'"
          class="inline-flex items-center gap-3 text-xs font-medium text-[#dde2e5] hover:text-accent [&>.iconify]:text-lg [&>.iconify]:text-accent"
        >{{ text.talk }}<UIcon name="i-lucide-arrow-up-right" /></NuxtLink><a
          v-if="project.demoUrl"
          :href="project.demoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-5 block text-sm text-accent"
        >Live demo ?</a><a
          v-if="project.repositoryUrl"
          :href="project.repositoryUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-3 block text-sm text-accent"
        >Repository ?</a>
      </aside>
    </div>
    <NuxtLink
      v-if="nextProject"
      :to="'/' + locale + '/projects/' + nextProject.slug"
      class="flex items-center justify-between gap-[25px] border-y border-line py-[30px] [&_span]:text-xs [&_span]:text-muted [&_h2]:mt-2 [&_h2]:text-[23px] [&_h2]:font-semibold sm:[&_h2]:text-[26px] [&>.iconify]:text-[38px] [&>.iconify]:text-accent"
    ><div><span>{{ text.nextProject }}</span><h2>{{ nextProject.title }}</h2></div><UIcon name="i-lucide-arrow-up-right" /></NuxtLink>
  </article>
</template>
