<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'owner' })
const route = useRoute()
const language = ref<'id' | 'en'>('id')
interface Preview {
  status: string
  technologies: string[]
  translations: { locale: string, title: string, summary: string, role: string, outcome: string }[]
  images: { mediaId: string, altId: string, altEn: string }[]
}
const { data, error } = await useFetch<{ data: Preview }>(() => '/api/admin/projects/' + route.params.id)
const project = computed(() => data.value?.data)
const translation = computed(() => project.value?.translations.find(item => item.locale === language.value))
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <NuxtLink
      to="/admin/projects"
      class="text-sm text-accent"
    >← Kembali ke proyek</NuxtLink>
    <div class="my-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-surface p-4">
      <p class="text-sm text-muted">
        Pratinjau privat dari konten tersimpan · {{ project?.status }}
      </p><USelect
        v-model="language"
        :items="[{ label: 'Indonesia', value: 'id' }, { label: 'English', value: 'en' }]"
      />
    </div>
    <p
      v-if="error"
      role="alert"
      class="text-accent"
    >
      Pratinjau tidak dapat dimuat. Periksa sesi dan proyek Anda.
    </p>
    <article
      v-else-if="translation"
      class="grid gap-6"
    >
      <h1 class="text-4xl font-bold wrap-anywhere">
        {{ translation.title || 'Judul belum diisi' }}
      </h1><p class="leading-relaxed whitespace-pre-line text-muted">
        {{ translation.summary }}
      </p>
      <img
        v-for="image in project?.images"
        :key="image.mediaId"
        :src="'/api/admin/media/' + image.mediaId + '/file'"
        :alt="language === 'id' ? image.altId : image.altEn"
        class="w-full rounded-xl border border-line object-cover"
      >
      <section>
        <h2 class="mb-3 text-xl font-semibold">
          {{ language === 'id' ? 'Peran' : 'Role' }}
        </h2><p class="leading-relaxed whitespace-pre-line text-muted">
          {{ translation.role }}
        </p>
      </section>
      <section>
        <h2 class="mb-3 text-xl font-semibold">
          {{ language === 'id' ? 'Hasil pekerjaan' : 'Outcome' }}
        </h2><p class="leading-relaxed whitespace-pre-line text-muted">
          {{ translation.outcome }}
        </p>
      </section>
      <ul class="flex flex-wrap gap-2">
        <li
          v-for="technology in project?.technologies"
          :key="technology"
          class="max-w-full rounded-md border border-line px-3 py-2 text-xs wrap-anywhere text-muted"
        >
          {{ technology }}
        </li>
      </ul>
    </article>
  </div>
</template>
