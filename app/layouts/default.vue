<script setup lang="ts">
const { locale, text } = usePortfolioLocale()
</script>

<template>
  <div class="min-h-screen bg-page text-ink">
    <a
      class="fixed -top-[70px] left-4 z-100 rounded-md bg-accent px-5 py-3 text-white focus:top-3"
      href="#main-content"
    >{{ text.skip }}</a>

    <PortfolioHeader />

    <main
      id="main-content"
      tabindex="-1"
    >
      <slot />
    </main>

    <footer class="flex flex-wrap items-center justify-between gap-[15px] border-t border-line py-[23px] sm:gap-[25px] sm:py-[26px] lg:flex-nowrap [&>a]:gap-1.5 [&>a]:text-[13px] sm:[&>a]:gap-[11px] sm:[&>a]:text-[15px] [&>a>.iconify]:size-7 [&>p]:hidden [&>p]:text-[10px] [&>p]:text-[#87969f] lg:[&>p]:block [&>span]:text-[9px] [&>span]:text-[#87969f] sm:[&>span]:text-[10px] mx-auto w-[calc(100%-32px)] max-w-7xl sm:w-[calc(100%-48px)] xl:w-[calc(100%-80px)]">
      <NuxtLink
        :to="'/' + locale"
        class="inline-flex shrink-0 items-center gap-[7px] text-base font-extrabold tracking-[-0.7px] sm:gap-[11px] sm:text-xl [&>.iconify]:size-[29px] [&>.iconify]:text-accent sm:[&>.iconify]:size-[35px]"
        aria-label="Portfolio"
      >
        <UIcon name="i-lucide-code-xml" />
        <span>Web Developer<span class="text-accent">.</span></span>
      </NuxtLink>
      <p>{{ text.footer }}</p>
      <span>© {{ new Date().getFullYear() }} · {{ text.rights }}</span>
    </footer>
  </div>
</template>
