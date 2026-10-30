<script setup lang="ts">
defineProps<{ image: { url: string, alt: string } | null }>()
</script>

<template>
  <div class="relative isolate aspect-3/2 overflow-hidden bg-[#111518] [&>img]:block [&>img]:size-full [&>img]:object-cover [&>img]:transition-transform [&>img]:duration-350 group-hover:[&>img]:scale-[1.025]">
    <img
      v-if="image"
      :src="image.url"
      :alt="image.alt"
      width="1536"
      height="1024"
      loading="lazy"
    >
  </div>
</template>
