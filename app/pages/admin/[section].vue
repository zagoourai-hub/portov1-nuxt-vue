<script setup lang="ts">
import { apiError } from '~/utils/apiError'
import { confirmDiscardChanges } from '~/utils/unsavedChanges'

definePageMeta({ layout: 'admin', middleware: 'owner', validate: route => ['profile', 'projects', 'experiences', 'skills', 'media', 'resume'].includes(String(route.params.section)) })
type Translation = { locale?: string, title: string, role: string, summary: string, photoAlt: string, outcome: string, description: string }
type Image = { mediaId: string, position: number, altId: string, altEn: string }
interface Row {
  id: string
  version: number
  status?: 'DRAFT' | 'PUBLISHED'
  name?: string
  email?: string
  linkedinUrl?: string
  photoId?: string | null
  company?: string
  startDate?: string
  endDate?: string | null
  slug?: string
  technologies?: string[]
  demoUrl?: string
  repositoryUrl?: string
  featured?: boolean
  position?: number
  translations?: (Partial<Translation> & { mediaId?: string })[]
  images?: Image[]
}
interface Media { id: string, kind: 'IMAGE' | 'PDF', state: string, byteSize: number, _count?: { images: number, profiles: number, resumes: number } }
const route = useRoute()
const request = useRequestFetch()
const section = computed(() => String(route.params.section))
const titles: Record<string, string> = { profile: 'Profil & kontak', projects: 'Proyek', experiences: 'Pengalaman', skills: 'Skill', media: 'Media', resume: 'CV bilingual' }
const singleton = computed(() => ['profile', 'resume'].includes(section.value))
const rows = ref<Row[]>([])
const media = ref<Media[]>([])
const page = ref(1)
const total = ref(0)
const mediaPage = ref(0)
const mediaTotal = ref(0)
const selectedId = ref('')
const editing = ref(false)
const pending = ref(false)
const loading = ref(false)
const error = shallowRef<unknown>(null)
const sessionExpired = computed(() => typeof error.value === 'object' && error.value !== null && 'statusCode' in error.value && error.value.statusCode === 401)
const notice = ref('')
const uploadKind = ref<'IMAGE' | 'PDF'>('IMAGE')
const uploadFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const blankTranslation = (): Translation => ({ title: '', role: '', summary: '', photoAlt: '', outcome: '', description: '' })
const blank = () => ({ version: 1, status: 'DRAFT' as 'DRAFT' | 'PUBLISHED', name: '', email: '', linkedinUrl: '', photoId: '', company: '', startDate: '', endDate: '', slug: '', technologies: '', demoUrl: '', repositoryUrl: '', featured: false, position: 0, images: [] as Image[], cv: { id: '', en: '' }, translations: { id: blankTranslation(), en: blankTranslation() } })
const form = reactive(blank())
const savedForm = ref('')
const hasUnsavedChanges = computed(() => editing.value && JSON.stringify(form) !== savedForm.value)
const languages = ['id', 'en'] as const
const imageOptions = computed(() => media.value.filter(item => item.kind === 'IMAGE' && item.state === 'READY').map(item => ({ label: item.id.slice(0, 8), value: item.id })))
const pdfOptions = computed(() => media.value.filter(item => item.kind === 'PDF' && item.state === 'READY').map(item => ({ label: item.id.slice(0, 8), value: item.id })))
const fields = computed<{ key: keyof Omit<Translation, 'locale'>, label: string, multiline?: boolean }[]>(() => {
  if (section.value === 'profile') return [{ key: 'role', label: 'Peran' }, { key: 'summary', label: 'Ringkasan', multiline: true }, { key: 'photoAlt', label: 'Deskripsi foto' }]
  if (section.value === 'projects') return [{ key: 'title', label: 'Judul' }, { key: 'summary', label: 'Ringkasan', multiline: true }, { key: 'role', label: 'Peran Anda' }, { key: 'outcome', label: 'Hasil pekerjaan', multiline: true }]
  return [{ key: 'role', label: 'Jabatan' }, { key: 'description', label: 'Deskripsi', multiline: true }]
})

function openRecord(row?: Row) {
  Object.assign(form, blank())
  selectedId.value = row?.id ?? ''
  editing.value = true
  if (!row) {
    savedForm.value = JSON.stringify(form)
    return
  }
  for (const key of ['name', 'email', 'linkedinUrl', 'company', 'slug', 'demoUrl', 'repositoryUrl'] as const) form[key] = row[key] ?? ''
  Object.assign(form, { version: row.version, status: row.status ?? 'DRAFT', photoId: row.photoId ?? '', position: row.position ?? 0, featured: row.featured ?? false, technologies: row.technologies?.join(', ') ?? '', images: row.images?.map(image => ({ mediaId: image.mediaId, position: image.position, altId: image.altId, altEn: image.altEn })) ?? [], startDate: row.startDate?.slice(0, 10) ?? '', endDate: row.endDate?.slice(0, 10) ?? '' })
  for (const language of languages) {
    const translation = row.translations?.find(item => item.locale === language)
    if (translation) Object.assign(form.translations[language], translation)
    form.cv[language] = translation?.mediaId ?? ''
  }
  savedForm.value = JSON.stringify(form)
}

function confirmDiscard() {
  if (pending.value) return false
  return !editing.value || confirmDiscardChanges(form, savedForm.value, () => window.confirm('Perubahan belum disimpan. Buang perubahan?'))
}

function openSelected(row?: Row) {
  if (confirmDiscard()) openRecord(row)
}

function warnBeforeUnload(event: BeforeUnloadEvent) {
  if (!hasUnsavedChanges.value) return
  event.preventDefault()
}

onBeforeRouteLeave(() => confirmDiscard())
onBeforeRouteUpdate(() => confirmDiscard())
onMounted(() => window.addEventListener('beforeunload', warnBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', warnBeforeUnload))

async function loadMedia(reset = false) {
  const next = reset ? 1 : mediaPage.value + 1
  const response = await request<{ data: Media[], meta: { total: number } }>('/api/admin/media', { query: { page: next, pageSize: 100 } })
  media.value = reset ? response.data : [...media.value, ...response.data]
  mediaPage.value = next
  mediaTotal.value = response.meta.total
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const response = await request<{ data: Row | Row[], meta?: { total: number } }>('/api/admin/' + section.value, { query: singleton.value ? {} : { page: page.value, pageSize: 20 } })
    rows.value = Array.isArray(response.data) ? response.data : response.data ? [response.data] : []
    total.value = response.meta?.total ?? rows.value.length
    if (singleton.value) openRecord(rows.value[0])
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}

function payload() {
  if (section.value === 'profile') return { version: form.version, name: form.name, email: form.email, linkedinUrl: form.linkedinUrl, photoId: form.photoId || null, translations: Object.fromEntries(languages.map((language) => {
    const item = form.translations[language]
    return [language, { role: item.role, summary: item.summary, photoAlt: item.photoAlt }]
  })) }
  if (section.value === 'resume') return { version: form.version, translations: { id: { mediaId: form.cv.id || null }, en: { mediaId: form.cv.en || null } } }
  const version = selectedId.value ? { version: form.version } : {}
  if (section.value === 'skills') return { ...version, name: form.name, position: Number(form.position) }
  if (section.value === 'projects') return { ...version, slug: form.slug, technologies: form.technologies.split(',').map(value => value.trim()).filter(Boolean), demoUrl: form.demoUrl || null, repositoryUrl: form.repositoryUrl || null, featured: form.featured, position: Number(form.position), images: form.images.map((image, index) => ({ ...image, position: index })), translations: Object.fromEntries(languages.map((language) => {
    const item = form.translations[language]
    return [language, { title: item.title, summary: item.summary, role: item.role, outcome: item.outcome }]
  })) }
  return { ...version, company: form.company, startDate: form.startDate, endDate: form.endDate || null, position: Number(form.position), translations: Object.fromEntries(languages.map((language) => {
    const item = form.translations[language]
    return [language, { role: item.role, description: item.description }]
  })) }
}

async function save() {
  pending.value = true
  error.value = null
  notice.value = ''
  try {
    const response = await request<{ data: Row }>('/api/admin/' + section.value + (singleton.value || !selectedId.value ? '' : '/' + selectedId.value), { method: singleton.value || selectedId.value ? 'PUT' : 'POST', body: payload() })
    await load()
    openRecord(response.data)
    notice.value = section.value === 'skills' ? 'Skill disimpan. Perubahan langsung tersedia di website.' : 'Draft disimpan. Belum ditampilkan kepada publik.'
  } catch (err) {
    error.value = err
  } finally {
    pending.value = false
  }
}

async function transition(publish: boolean) {
  if (!confirmDiscard()) return
  pending.value = true
  error.value = null
  notice.value = ''
  try {
    const url = '/api/admin/' + section.value + (singleton.value ? '' : '/' + selectedId.value)
    await request(url + (publish ? '/publish' : '/unpublish'), { method: 'POST', body: { version: form.version } })
    await load()
    const updated = rows.value.find(row => row.id === selectedId.value)
    if (updated) openRecord(updated)
    notice.value = publish ? 'Konten berhasil dipublikasikan.' : 'Konten tidak lagi tampil di publik. Anda dapat mengedit sekarang.'
  } catch (err) {
    error.value = err
  } finally {
    pending.value = false
  }
}

async function remove(row: Row | Media) {
  if (!confirmDiscard()) return
  if (!window.confirm('Hapus item ini? Tindakan ini tidak dapat dibatalkan.')) return
  pending.value = true
  error.value = null
  try {
    await request('/api/admin/' + section.value + '/' + row.id, { method: 'DELETE', ...('version' in row ? { body: { version: row.version } } : {}) })
    editing.value = false
    await load()
    if (section.value === 'media') await loadMedia(true)
    notice.value = 'Item dihapus.'
  } catch (err) {
    error.value = err
  } finally {
    pending.value = false
  }
}

async function upload() {
  if (!uploadFile.value) return
  pending.value = true
  error.value = null
  try {
    const body = new FormData()
    body.append('kind', uploadKind.value)
    body.append('file', uploadFile.value)
    await request('/api/admin/media', { method: 'POST', body })
    uploadFile.value = null
    if (fileInput.value) fileInput.value.value = ''
    await loadMedia(true)
    await load()
    notice.value = 'Upload berhasil. Pilih media ini pada konten yang sesuai.'
  } catch (err) {
    error.value = err
  } finally {
    pending.value = false
  }
}

watch(section, async () => {
  page.value = 1
  editing.value = false
  notice.value = ''
  await load()
})
watch(page, load)
await load()
try {
  await loadMedia(true)
} catch (err) {
  error.value = err
}
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <div class="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="mb-3 text-xs tracking-[2px] text-accent uppercase">
          Kelola konten
        </p><h1 class="text-3xl font-bold">
          {{ titles[section] }}
        </h1>
      </div>
      <UButton
        v-if="!singleton && section !== 'media'"
        icon="i-lucide-plus"
        @click="openSelected()"
      >
        Tambah {{ titles[section]?.toLowerCase() }}
      </UButton>
    </div>
    <p
      v-if="error"
      role="alert"
      class="mb-5 rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-accent"
    >
      {{ apiError(error) }} <NuxtLink
        v-if="sessionExpired"
        to="/admin/login"
        class="underline"
      >Login kembali</NuxtLink>
    </p>
    <p
      v-if="notice"
      role="status"
      class="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-300"
    >
      {{ notice }}
    </p>
    <p
      v-if="loading"
      role="status"
      class="mb-5 text-sm text-muted"
    >
      Memuat konten…
    </p>

    <section
      v-if="section === 'media'"
      class="mb-7 rounded-xl border border-line bg-surface p-6"
    >
      <h2 class="text-lg font-semibold">
        Upload media privat
      </h2>
      <p class="mt-2 text-sm text-muted">
        JPEG, PNG, WebP ≤ 5 MB; PDF ≤ 10 MB. File baru menjadi publik setelah konten yang menggunakannya dipublikasikan.
      </p>
      <form
        class="mt-5 flex flex-wrap items-end gap-4"
        @submit.prevent="upload"
      >
        <UFormField label="Jenis media">
          <USelect
            v-model="uploadKind"
            :items="[{ label: 'Gambar', value: 'IMAGE' }, { label: 'PDF CV', value: 'PDF' }]"
            class="w-40"
          />
        </UFormField>
        <label class="grid gap-2 text-sm">File<input
          ref="fileInput"
          type="file"
          :accept="uploadKind === 'IMAGE' ? 'image/jpeg,image/png,image/webp' : 'application/pdf'"
          required
          class="max-w-full rounded-md border border-line p-2 text-sm"
          @change="uploadFile = ($event.target as HTMLInputElement).files?.[0] ?? null"
        ></label>
        <UButton
          type="submit"
          :loading="pending"
        >
          Upload
        </UButton>
      </form>
    </section>

    <section
      v-if="!singleton"
      class="overflow-hidden rounded-xl border border-line bg-surface"
    >
      <p
        v-if="!rows.length && !loading"
        class="p-6 text-sm text-muted"
      >
        Belum ada {{ titles[section]?.toLowerCase() }}. Tambahkan item pertama Anda.
      </p>
      <div
        v-for="row in rows"
        :key="row.id"
        class="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5 last:border-b-0"
      >
        <div class="min-w-0">
          <h2 class="truncate font-semibold">
            {{ row.name || row.company || row.translations?.find(item => item.locale === 'id')?.title || row.slug || row.id.slice(0, 8) }}
          </h2><p class="mt-1 text-xs text-muted">
            {{ row.status || (section === 'skills' ? 'Langsung tampil publik' : 'Media privat / tergantung referensi') }} <span v-if="'state' in row">· {{ row.state }}</span>
          </p>
        </div>
        <div class="flex gap-2">
          <UButton
            v-if="section !== 'media'"
            color="neutral"
            variant="outline"
            @click="openSelected(row)"
          >
            Buka
          </UButton><UButton
            v-if="section === 'media'"
            :to="'/api/admin/media/' + row.id + '/file'"
            target="_blank"
            color="neutral"
            variant="outline"
          >
            Lihat file
          </UButton><UButton
            v-if="row.status !== 'PUBLISHED'"
            color="error"
            variant="ghost"
            :disabled="pending"
            @click="remove(row)"
          >
            Hapus
          </UButton>
        </div>
      </div>
      <div
        v-if="total > 20"
        class="flex items-center justify-between gap-3 border-t border-line p-4"
      >
        <UButton
          :disabled="page === 1 || loading"
          color="neutral"
          variant="outline"
          @click="page--"
        >
          Sebelumnya
        </UButton><span class="text-xs text-muted">Halaman {{ page }} / {{ Math.ceil(total / 20) }}</span><UButton
          :disabled="page * 20 >= total || loading"
          color="neutral"
          variant="outline"
          @click="page++"
        >
          Berikutnya
        </UButton>
      </div>
    </section>

    <section
      v-if="editing && section !== 'media'"
      class="mt-7 rounded-xl border border-line bg-surface p-5 sm:p-8"
    >
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 class="text-xl font-semibold">
          {{ selectedId ? 'Edit ' : 'Tambah ' }}{{ titles[section]?.toLowerCase() }}
        </h2><span
          v-if="section !== 'skills'"
          class="rounded-full border border-line px-3 py-1 text-xs"
        >{{ form.status }}</span>
      </div>
      <div
        v-if="form.status === 'PUBLISHED'"
        class="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200"
      >
        <p>Konten ini sedang tampil di website. Unpublish akan menyembunyikannya sementara agar bisa diedit.</p><UButton
          class="mt-4"
          color="warning"
          :loading="pending"
          @click="transition(false)"
        >
          Unpublish untuk mengedit
        </UButton>
      </div>
      <form
        class="grid gap-6"
        @submit.prevent="save"
      >
        <fieldset
          :disabled="pending || form.status === 'PUBLISHED'"
          class="grid min-w-0 gap-6 disabled:opacity-60"
        >
          <div
            v-if="section === 'profile'"
            class="grid gap-5 sm:grid-cols-2"
          >
            <UFormField label="Nama">
              <UInput
                v-model="form.name"
                maxlength="160"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Email kontak">
              <UInput
                v-model="form.email"
                type="email"
                maxlength="254"
                class="w-full"
              />
            </UFormField>
            <UFormField label="URL LinkedIn">
              <UInput
                v-model="form.linkedinUrl"
                type="url"
                placeholder="https://www.linkedin.com/in/..."
                class="w-full"
              />
            </UFormField>
            <UFormField label="Foto profil">
              <USelect
                v-model="form.photoId"
                :items="imageOptions"
                placeholder="Pilih gambar"
                class="w-full"
              /><button
                v-if="form.photoId"
                type="button"
                class="mt-2 text-xs text-muted"
                @click="form.photoId = ''"
              >
                Lepas foto
              </button>
            </UFormField>
          </div>
          <div
            v-if="section === 'projects'"
            class="grid gap-5 sm:grid-cols-2"
          >
            <UFormField
              label="Slug URL"
              required
            >
              <UInput
                v-model="form.slug"
                placeholder="nama-proyek"
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                required
                maxlength="100"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Teknologi (pisahkan koma)">
              <UInput
                v-model="form.technologies"
                placeholder="Nuxt, TypeScript, SQLite"
                class="w-full"
              />
            </UFormField>
            <UFormField label="URL demo (opsional)">
              <UInput
                v-model="form.demoUrl"
                type="url"
                class="w-full"
              />
            </UFormField>
            <UFormField label="URL repository (opsional)">
              <UInput
                v-model="form.repositoryUrl"
                type="url"
                class="w-full"
              />
            </UFormField>
            <UCheckbox
              v-model="form.featured"
              label="Tampilkan sebagai proyek unggulan"
            />
          </div>
          <div
            v-if="section === 'experiences'"
            class="grid gap-5 sm:grid-cols-3"
          >
            <UFormField label="Perusahaan">
              <UInput
                v-model="form.company"
                maxlength="160"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Tanggal mulai"
              required
            >
              <UInput
                v-model="form.startDate"
                type="date"
                required
                class="w-full"
              />
            </UFormField>
            <UFormField label="Tanggal akhir (kosong = masih berlangsung)">
              <UInput
                v-model="form.endDate"
                type="date"
                :min="form.startDate"
                class="w-full"
              />
            </UFormField>
          </div>
          <UFormField
            v-if="section === 'skills'"
            label="Nama skill"
            required
          >
            <UInput
              v-model="form.name"
              required
              maxlength="80"
              class="w-full"
            /><p class="mt-2 text-xs text-muted">
              Skill merupakan label bersama dan langsung tampil setelah disimpan.
            </p>
          </UFormField>
          <UFormField
            v-if="['projects', 'experiences', 'skills'].includes(section)"
            label="Urutan (angka terkecil ditampilkan dahulu)"
          >
            <UInput
              v-model.number="form.position"
              type="number"
              min="0"
              max="100000"
              required
            />
          </UFormField>

          <div
            v-if="['profile', 'projects', 'experiences'].includes(section)"
            class="grid gap-5 xl:grid-cols-2"
          >
            <section
              v-for="language in languages"
              :key="language"
              class="min-w-0 rounded-lg border border-line p-5"
            >
              <h3 class="mb-5 text-sm font-semibold text-accent">
                {{ language === 'id' ? 'Bahasa Indonesia' : 'English' }}
              </h3>
              <div class="grid gap-5">
                <UFormField
                  v-for="field in fields"
                  :key="field.key"
                  :label="field.label + ' (' + language.toUpperCase() + ')'"
                >
                  <UTextarea
                    v-if="field.multiline"
                    v-model="form.translations[language][field.key]"
                    :rows="4"
                    :maxlength="['description', 'outcome'].includes(field.key) ? 10000 : 1000"
                    class="w-full"
                  />
                  <UInput
                    v-else
                    v-model="form.translations[language][field.key]"
                    :maxlength="field.key === 'photoAlt' ? 200 : 160"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </section>
          </div>
          <div
            v-if="section === 'projects'"
            class="grid gap-4"
          >
            <h3 class="font-semibold">
              Galeri proyek
            </h3>
            <div
              v-for="(image, index) in form.images"
              :key="index"
              class="grid gap-3 rounded-lg border border-line p-4 sm:grid-cols-2"
            >
              <UFormField label="Gambar">
                <USelect
                  v-model="image.mediaId"
                  :items="imageOptions"
                  class="w-full"
                  required
                />
              </UFormField>
              <div class="flex items-end gap-2">
                <UButton
                  type="button"
                  color="neutral"
                  variant="outline"
                  :disabled="index === 0"
                  @click="form.images.splice(index - 1, 0, form.images.splice(index, 1)[0]!)"
                >
                  Naik
                </UButton><UButton
                  type="button"
                  color="error"
                  variant="ghost"
                  @click="form.images.splice(index, 1)"
                >
                  Lepas
                </UButton>
              </div>
              <UFormField label="Deskripsi gambar (ID)">
                <UInput
                  v-model="image.altId"
                  maxlength="200"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Deskripsi gambar (EN)">
                <UInput
                  v-model="image.altEn"
                  maxlength="200"
                  class="w-full"
                />
              </UFormField>
            </div>
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              :disabled="form.images.length >= 20"
              class="w-fit"
              @click="form.images.push({ mediaId: '', position: form.images.length, altId: '', altEn: '' })"
            >
              Tambah gambar
            </UButton>
          </div>
          <div
            v-if="section === 'resume'"
            class="grid gap-5 sm:grid-cols-2"
          >
            <UFormField
              v-for="language in languages"
              :key="language"
              :label="'PDF CV — ' + language.toUpperCase()"
            >
              <USelect
                v-model="form.cv[language]"
                :items="pdfOptions"
                placeholder="Pilih PDF"
                class="w-full"
              /><button
                v-if="form.cv[language]"
                type="button"
                class="mt-2 text-xs text-muted"
                @click="form.cv[language] = ''"
              >
                Lepas PDF
              </button>
            </UFormField>
          </div>
        </fieldset>
        <p
          v-if="['profile', 'projects', 'resume'].includes(section)"
          class="text-xs leading-relaxed text-muted"
        >
          Upload file di <NuxtLink
            to="/admin/media"
            target="_blank"
            class="text-accent underline"
          >halaman Media</NuxtLink>, kemudian <button
            type="button"
            class="text-accent underline"
            @click="loadMedia(true).catch(err => error = err)"
          >
            muat ulang pilihan
          </button>. Media bersama yang dipakai konten published tetap dapat diakses publik.
        </p>
        <UButton
          v-if="media.length < mediaTotal"
          type="button"
          color="neutral"
          variant="outline"
          class="w-fit"
          @click="loadMedia().catch(err => error = err)"
        >
          Muat pilihan media berikutnya
        </UButton>
        <div
          v-if="form.status !== 'PUBLISHED'"
          class="flex flex-wrap gap-3"
        >
          <UButton
            type="submit"
            :loading="pending"
          >
            {{ section === 'skills' ? 'Simpan skill' : 'Simpan draft' }}
          </UButton><UButton
            v-if="selectedId && section !== 'skills'"
            type="button"
            color="neutral"
            variant="outline"
            :disabled="pending"
            @click="transition(true)"
          >
            Publikasikan draft tersimpan
          </UButton>
        </div>
      </form>
    </section>
  </div>
</template>
