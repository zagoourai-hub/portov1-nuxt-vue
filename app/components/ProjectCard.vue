<script setup lang="ts">
import type { PublicProject } from '~~/shared/publicTypes'

defineProps<{ project: PublicProject, number?: number }>()
const { locale, text } = usePortfolioLocale()
</script>

<template>
  <article
    data-reveal
    class="group min-w-0 overflow-hidden rounded-[9px] border border-line bg-linear-140 from-[#11181b] to-[#0b1012] transition-[border-color,transform] duration-200 hover:border-[#74313d] motion-safe:hover:[transform:perspective(1000px)_rotateX(2deg)_translateY(-4px)] [&_h3]:mt-[11px] [&_h3]:mb-2.5 [&_h3]:text-[21px] [&_h3]:leading-[1.3] [&_h3]:font-bold [&_h3]:tracking-[-0.5px] sm:[&_h3]:text-lg xl:[&_h3]:text-xl [&_p]:text-xs [&_p]:leading-[1.7] [&_p]:text-muted sm:[&_p]:min-h-[60px]"
  >
    <NuxtLink
      :to="'/' + locale + '/projects/' + project.slug"
      class="relative block overflow-hidden"
      :aria-label="text.viewProject + ': ' + project.title"
    >
      <ProjectPreview :image="project.cover" />
      <span class="absolute top-3.5 right-3.5 grid size-[31px] place-items-center rounded-full border border-white/20 bg-[#0b101288] opacity-0 transition-opacity duration-200 group-hover:opacity-100 in-focus-visible:opacity-100"><UIcon name="i-lucide-arrow-up-right" /></span>
    </NuxtLink>
    <div class="p-[22px] sm:p-[17px] xl:p-[21px]">
      <div class="flex items-center justify-between text-[9px] tracking-[1px] text-[#a6b0b8] uppercase">
        <span>{{ project.technologies[0] }}</span><span>/ {{ String(number ?? project.position + 1).padStart(2, '0') }}</span>
      </div>
      <h3><NuxtLink :to="'/' + locale + '/projects/' + project.slug">{{ project.title }}</NuxtLink></h3>
      <p>{{ project.summary }}</p>
      <div class="mt-[22px] flex items-center justify-between gap-2">
        <div class="flex flex-wrap gap-1.5 [&>span]:rounded-sm [&>span]:border [&>span]:border-white/2 [&>span]:bg-[#1a2327] [&>span]:px-[7px] [&>span]:py-1.5 [&>span]:text-[9px] [&>span]:text-[#c8d0d5]">
          <span
            v-for="technology in project.technologies"
            :key="technology"
          >{{ technology }}</span>
        </div>
        <NuxtLink
          :to="'/' + locale + '/projects/' + project.slug"
          class="grid size-[29px] shrink-0 place-items-center rounded-full border border-[#637079] hover:border-accent hover:bg-accent"
          :aria-label="text.viewProject + ': ' + project.title"
        ><UIcon name="i-lucide-arrow-up-right" /></NuxtLink>
      </div>
    </div>
  </article>
</template>
