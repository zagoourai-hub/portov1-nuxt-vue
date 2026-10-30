<script setup lang="ts">
const { locale, text, localePath } = usePortfolioLocale()
const route = useRoute()
const { data: content } = await usePortfolioContent()
const resume = computed(() => content.value?.data.resume)
const isMenuOpen = ref(false)
const isCvNoticeOpen = ref(false)
const links = computed(() => [
  { label: text.value.home, to: '/' + locale.value, section: '' },
  { label: text.value.about, to: '/' + locale.value + '#about', section: '#about' },
  { label: text.value.projects, to: '/' + locale.value + '/projects', section: 'projects' },
  { label: text.value.experience, to: '/' + locale.value + '#experience', section: '#experience' },
  { label: text.value.contact, to: '/' + locale.value + '#contact', section: '#contact' }
].filter((link) => {
  if (link.section === '#about' || link.section === '#contact') return Boolean(content.value?.data.profile)
  if (link.section === '#experience') return Boolean(content.value?.data.experiences.data.length)
  return true
}))

function isActive(section: string) {
  if (section === 'projects') return route.path.includes('/projects')
  if (section) return route.hash === section
  return !route.path.includes('/projects') && !route.hash
}

watch(() => route.fullPath, () => {
  isMenuOpen.value = false
  isCvNoticeOpen.value = false
})
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-white/4 bg-page/95 backdrop-blur-[18px]">
    <div class="flex h-[69px] items-center gap-2.5 sm:h-[75px] sm:gap-5 lg:h-[88px] xl:gap-[30px] mx-auto w-[calc(100%-32px)] max-w-7xl sm:w-[calc(100%-48px)] xl:w-[calc(100%-80px)]">
      <NuxtLink
        :to="'/' + locale"
        class="inline-flex shrink-0 items-center gap-[7px] text-base font-extrabold tracking-[-0.7px] sm:gap-[11px] sm:text-xl [&>.iconify]:size-[29px] [&>.iconify]:text-accent sm:[&>.iconify]:size-[35px]"
        aria-label="Portfolio"
      >
        <UIcon name="i-lucide-code-xml" />
        <span>Web Developer<span class="text-accent">.</span></span>
      </NuxtLink>
      <nav
        class="mx-auto hidden h-full items-center gap-5 lg:flex xl:gap-[30px] [&>a]:relative [&>a]:py-8 [&>a]:text-[13px] [&>a]:font-semibold [&>a]:text-[#a8b0b6] [&>a:hover]:text-white"
        :aria-label="text.navigation"
      >
        <NuxtLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          :class="isActive(link.section) ? 'text-white! after:absolute after:bottom-[23px] after:left-0 after:h-0.5 after:w-5 after:bg-accent' : ''"
          :aria-current="isActive(link.section) ? 'page' : undefined"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
      <div class="ml-auto flex items-center gap-2 sm:gap-3 lg:ml-0 xl:gap-5">
        <div
          class="flex gap-0.5 rounded-full border border-line p-[3px] sm:p-1 [&>a]:grid [&>a]:h-[26px] [&>a]:w-[29px] [&>a]:place-items-center [&>a]:rounded-full [&>a]:text-[10px] [&>a]:font-bold [&>a]:text-muted sm:[&>a]:h-[30px] sm:[&>a]:w-9 sm:[&>a]:text-[11px]"
          aria-label="Language"
        >
          <NuxtLink
            v-for="language in (['id', 'en'] as const)"
            :key="language"
            :to="localePath(language)"
            :class="locale === language ? 'bg-accent text-white!' : ''"
            :aria-current="locale === language ? 'true' : undefined"
            :aria-label="language === 'id' ? 'Bahasa Indonesia' : 'English'"
            :lang="language"
          >
            {{ language.toUpperCase() }}
          </NuxtLink>
        </div>
        <UButton
          color="neutral"
          variant="outline"
          class="min-h-[39px] rounded-md border border-[#4b545a] bg-transparent px-3.5 py-2 text-xs text-white hidden sm:inline-flex"
          trailing-icon="i-lucide-download"
          :to="resume?.downloadUrl"
          external
          :aria-expanded="isCvNoticeOpen"
          @click="!resume && (isCvNoticeOpen = !isCvNoticeOpen)"
        >
          {{ text.cv }}
        </UButton>
        <UButton
          color="neutral"
          variant="ghost"
          class="inline-flex text-white lg:hidden"
          :icon="isMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
          :aria-label="isMenuOpen ? text.closeMenu : text.openMenu"
          :aria-expanded="isMenuOpen"
          aria-controls="mobile-navigation"
          @click="isMenuOpen = !isMenuOpen"
        />
      </div>
    </div>
    <nav
      v-if="isMenuOpen"
      id="mobile-navigation"
      class="grid gap-1.5 border-t border-line px-6 pt-3 pb-[22px] lg:hidden [&>a]:rounded-[5px] [&>a]:p-3 [&>a]:text-muted"
      :aria-label="text.navigation"
      @keydown.esc="isMenuOpen = false"
    >
      <NuxtLink
        v-for="link in links"
        :key="link.label"
        :to="link.to"
        :class="isActive(link.section) ? 'bg-surface text-white!' : ''"
      >{{ link.label }}</NuxtLink>
      <UButton
        variant="outline"
        color="neutral"
        trailing-icon="i-lucide-download"
        :to="resume?.downloadUrl"
        external
        @click="!resume && (isCvNoticeOpen = !isCvNoticeOpen)"
      >
        {{ text.cv }}
      </UButton>
    </nav>
    <div
      v-if="isCvNoticeOpen"
      class="flex items-center gap-3 py-3 text-[13px] text-[#d6dde1] [&>p]:flex-1 [&>.iconify]:text-accent mx-auto w-[calc(100%-32px)] max-w-7xl sm:w-[calc(100%-48px)] xl:w-[calc(100%-80px)]"
      role="status"
    >
      <UIcon name="i-lucide-info" />
      <p>{{ text.cvUnavailable }}</p>
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        :aria-label="locale === 'id' ? 'Tutup' : 'Close'"
        @click="isCvNoticeOpen = false"
      />
    </div>
  </header>
</template>
