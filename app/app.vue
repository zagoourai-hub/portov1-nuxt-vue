<script setup lang="ts">
useHead({
  htmlAttrs: { class: 'scheme-dark scroll-smooth scroll-pt-[100px] bg-page motion-reduce:scroll-auto' },
  bodyAttrs: {
    class: 'm-0 font-sans selection:bg-[#ae1730] selection:text-white [&_a]:touch-manipulation [&_a]:cursor-pointer [&_a]:transition-[background-color,border-color,color,transform] [&_a]:duration-200 [&_button]:touch-manipulation [&_button]:transition-[background-color,border-color,color,transform] [&_button]:duration-200 [&_button:not(:disabled)]:cursor-pointer [&_:is(a,button,input):focus-visible]:outline-2 [&_:is(a,button,input):focus-visible]:outline-offset-[5px] [&_:is(a,button,input):focus-visible]:outline-[#ff7889] motion-reduce:[&_*]:transition-none! motion-reduce:[&_*]:animate-none! motion-reduce:[&_*::before]:transition-none! motion-reduce:[&_*::after]:transition-none! motion-reduce:[&_*::before]:animate-none! motion-reduce:[&_*::after]:animate-none! [&_:is(a,button)]:[-webkit-tap-highlight-color:transparent]'
  },
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
