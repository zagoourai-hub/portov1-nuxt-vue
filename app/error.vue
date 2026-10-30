<script setup lang="ts">
import type { NuxtError } from '#app'
import { messages } from '~/data/portfolio'

const props = defineProps<{ error: NuxtError }>()
const route = useRoute()
const locale = computed(() => route.path.startsWith('/en') ? 'en' : 'id')
const text = computed(() => messages[locale.value])
useHead(() => ({ htmlAttrs: { lang: locale.value, class: 'scheme-dark bg-page font-sans' } }))
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-5 p-[30px] text-center [&>.iconify]:text-[60px] [&>.iconify]:text-accent [&>h1]:text-[clamp(30px,5vw,55px)] [&>h1]:font-bold [&>p]:text-muted bg-page text-ink">
    <UIcon name="i-lucide-code-xml" />
    <p class="mb-[15px] flex items-center gap-[9px] text-[9px] leading-normal font-bold tracking-[1.3px] text-[#d2d8dc] sm:text-[11px] sm:tracking-[1.8px] [&>span]:pr-0.5 [&>span]:text-[17px] [&>span]:tracking-[-2px] [&>span]:text-accent [&>span]:italic">
      ERROR {{ props.error.statusCode }}
    </p>
    <h1>{{ props.error.statusCode === 404 ? text.notFound : (locale === 'id' ? 'Terjadi kesalahan' : 'Something went wrong') }}</h1>
    <p>{{ text.notFoundText }}</p>
    <button
      class="mt-[15px] cursor-pointer rounded-md bg-accent px-6 py-[13px] text-white focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-[#ff7889]"
      @click="clearError({ redirect: '/' + locale })"
    >
      {{ text.backHome }} →
    </button>
  </div>
</template>
