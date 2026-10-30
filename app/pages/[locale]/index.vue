<script setup lang="ts">
import workstationImage from '~/assets/image/workstation_bg.png/screen.png'
import contactImage from '~/assets/image/contact_night_bg.png/screen.png'
import { skills as technologyStyles } from '~/data/portfolio'
import { assetPath } from '~/utils/assetPath'

definePageMeta({ validate: route => route.params.locale === 'id' || route.params.locale === 'en' })
const { locale, text } = usePortfolioLocale()

const { data: content, error: contentError } = await usePortfolioContent()
const portfolio = computed(() => content.value?.data)
const projects = computed(() => portfolio.value?.projects.data ?? [])
const skills = computed(() => (portfolio.value?.skills ?? []).map(skill => ({ ...skill, ...technologyStyles.find(style => style.name.toLowerCase() === skill.name.toLowerCase()) })))
const experience = computed(() => portfolio.value?.experiences.data ?? [])

function period(start: string, end: string | null) {
  return new Intl.DateTimeFormat(locale.value, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(start)) + ' — ' + (end ? new Intl.DateTimeFormat(locale.value, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(end)) : locale.value === 'id' ? 'Sekarang' : 'Present')
}

useSeoMeta({
  title: 'I AM A WEB DEVELOPER - Web Developer & Digital Creator',
  description: () => portfolio.value?.profile?.summary || text.value.heroDescription,
  ogTitle: 'I AM A WEB DEVELOPER - Web Developer',
  ogDescription: () => portfolio.value?.profile?.summary || text.value.heroDescription
})
</script>

<template>
  <div>
    <p
      v-if="contentError"
      role="alert"
      class="mx-auto max-w-7xl p-5 text-sm text-accent"
    >
      {{ locale === 'id' ? 'Konten belum dapat dimuat. Silakan coba kembali.' : 'Content could not be loaded. Please try again.' }}
    </p>
    <PortfolioHero class="mx-auto w-full max-w-7xl sm:w-[calc(100%-48px)] xl:w-[calc(100%-80px)]" />

    <section
      id="projects"
      class="py-11 sm:py-[55px] lg:py-[76px] mx-auto w-[calc(100%-32px)] max-w-7xl sm:w-[calc(100%-48px)] xl:w-[calc(100%-80px)]"
    >
      <div class="mb-6 flex items-end justify-between gap-3.5 sm:mb-7 sm:gap-5 [&_p]:mb-2 [&>a]:max-w-[110px] [&>a]:gap-[7px] [&>a]:text-[10px] sm:[&>a]:max-w-none sm:[&>a]:gap-3 sm:[&>a]:text-xs">
        <div>
          <p class="mb-[15px] flex items-center gap-[9px] text-[9px] leading-normal font-bold tracking-[1.3px] text-[#d2d8dc] sm:text-[11px] sm:tracking-[1.8px] [&>span]:pr-0.5 [&>span]:text-[17px] [&>span]:tracking-[-2px] [&>span]:text-accent [&>span]:italic">
            <span>//</span> {{ text.selected }}
          </p><h2 class="m-0 text-[32px] leading-[1.1] sm:text-[clamp(30px,3.6vw,46px)]">
            {{ text.latest }}
          </h2>
        </div>
        <NuxtLink
          :to="'/' + locale + '/projects'"
          class="inline-flex items-center gap-3 text-xs font-medium text-[#dde2e5] hover:text-accent [&>.iconify]:text-lg [&>.iconify]:text-accent"
        >{{ text.allProjects }} <UIcon name="i-lucide-arrow-up-right" /></NuxtLink>
      </div>
      <div class="grid grid-cols-1 gap-[22px] sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-4 xl:gap-6">
        <ProjectCard
          v-for="(project, index) in projects"
          :key="project.slug"
          :project="project"
          :number="index + 1"
        />
      </div>
      <p
        v-if="!projects.length"
        class="text-sm text-muted"
      >
        {{ locale === 'id' ? 'Karya pilihan segera hadir.' : 'Selected work is coming soon.' }}
      </p>
    </section>

    <section
      v-if="portfolio?.profile"
      id="about"
      data-reveal
      class="grid items-center gap-[30px] border-t border-line lg:grid-cols-[0.9fr_1.1fr] lg:gap-[35px] xl:gap-[72px] py-11 sm:py-[55px] lg:py-[76px] mx-auto w-[calc(100%-32px)] max-w-7xl sm:w-[calc(100%-48px)] xl:w-[calc(100%-80px)]"
    >
      <div class="relative h-full min-h-[290px] overflow-hidden rounded-lg border border-line bg-[#0c1013] sm:min-h-[300px] lg:min-h-[450px] [&>img]:absolute [&>img]:inset-0 [&>img]:size-full [&>img]:object-cover [&>img]:object-[67%_center] [&>img]:opacity-75">
        <img
          :src="portfolio.profile.photoUrl || assetPath(workstationImage)"
          :alt="portfolio.profile.photoAlt"
          width="1600"
          height="900"
          loading="lazy"
        ><div class="absolute inset-0 bg-[linear-gradient(90deg,#0b0f1370,#080b0d00),linear-gradient(0deg,#080b0dd9,transparent_45%)]" /><div
          class="absolute top-[25px] left-8 grid gap-[26px] lg:top-[37px] [&>.iconify]:text-[30px] [&>.iconify]:text-accent lg:[&>.iconify]:text-[43px] [&>span]:font-display [&>span]:text-[38px] [&>span]:leading-[1.15] [&>span]:tracking-[1px] [&>span]:text-white lg:[&>span]:text-[50px] [&_em]:text-accent [&_em]:not-italic"
          aria-hidden="true"
        >
          <UIcon name="i-lucide-code-xml" /><span>BUILD.<br>LEARN.<br><em>REPEAT.</em></span>
        </div><span class="absolute right-5 bottom-[25px] left-[30px] text-[8px] tracking-[1.6px] text-[#adb7bd]">THE SPACE WHERE IDEAS BECOME REAL.</span>
      </div>
      <div class="[&>h2]:max-w-[600px] [&>h2]:text-[30px] [&>h2]:leading-[1.3] [&>h2]:font-bold [&>h2]:tracking-[-1.2px] sm:[&>h2]:text-[32px] sm:[&>h2]:leading-[1.25] lg:[&>h2]:max-w-[490px] lg:[&>h2]:text-[clamp(25px,3vw,38px)] [&>h2>span]:text-accent [&>p:last-of-type]:mt-[23px] [&>p:last-of-type]:text-[13px] sm:[&>p:last-of-type]:text-sm">
        <p class="mb-[15px] flex items-center gap-[9px] text-[9px] leading-normal font-bold tracking-[1.3px] text-[#d2d8dc] sm:text-[11px] sm:tracking-[1.8px] [&>span]:pr-0.5 [&>span]:text-[17px] [&>span]:tracking-[-2px] [&>span]:text-accent [&>span]:italic">
          <span>//</span> {{ text.aboutLabel }}
        </p><h2>{{ portfolio.profile.name }}</h2><p class="text-sm leading-[1.9] text-muted">
          {{ portfolio.profile.summary }}
        </p>
        <div class="mt-7 grid grid-cols-2 gap-2.5 sm:gap-3">
          <div
            v-for="value in text.values"
            :key="value.title"
            class="flex flex-col items-start gap-3 rounded-md border border-[#1f292e] bg-[#0e1518] px-[13px] py-[17px] sm:flex-row sm:p-[18px] lg:gap-[9px] lg:px-2.5 lg:py-3.5 xl:gap-3 xl:px-[13px] xl:py-[17px] [&>.iconify]:mt-0.5 [&>.iconify]:shrink-0 [&>.iconify]:text-[26px] [&>.iconify]:text-accent [&_h3]:mb-[5px] [&_h3]:text-[11px] [&_h3]:font-bold [&_p]:text-[10px] [&_p]:leading-[1.7] [&_p]:text-muted"
          >
            <UIcon :name="value.icon" /><div><h3>{{ value.title }}</h3><p>{{ value.text }}</p></div>
          </div>
        </div>
      </div>
    </section>

    <section
      v-if="skills.length"
      data-reveal
      class="flex flex-col items-start justify-between gap-7 border-y border-line py-9 lg:flex-row lg:items-center lg:gap-[35px] [&_p]:mb-1.5 [&_p]:text-[9px] [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-[-0.5px] [&_h2]:whitespace-nowrap mx-auto w-[calc(100%-32px)] max-w-7xl sm:w-[calc(100%-48px)] xl:w-[calc(100%-80px)]"
    >
      <div>
        <p class="mb-[15px] flex items-center gap-[9px] text-[9px] leading-normal font-bold tracking-[1.3px] text-[#d2d8dc] sm:text-[11px] sm:tracking-[1.8px] [&>span]:pr-0.5 [&>span]:text-[17px] [&>span]:tracking-[-2px] [&>span]:text-accent [&>span]:italic">
          <span>//</span> {{ text.stack }}
        </p><h2>{{ text.stackTitle }}</h2>
      </div>
      <div class="grid w-full grid-cols-3 gap-[27px] sm:flex sm:flex-wrap sm:justify-between sm:gap-[18px] lg:w-auto lg:justify-end lg:gap-[22px] xl:gap-[31px] [&>div]:grid [&>div]:justify-items-center [&>div]:gap-[9px] [&_.iconify]:size-[27px] [&_span]:text-[9px] [&_span]:text-[#b4bfc6]">
        <div
          v-for="skill in skills"
          :key="skill.name"
        >
          <UIcon
            :name="skill.icon || 'i-lucide-code-xml'"
            :class="skill.colorClass"
          /><span>{{ skill.name }}</span>
        </div>
      </div>
    </section>

    <section
      v-if="experience.length"
      id="experience"
      data-reveal
      class="grid gap-[30px] lg:grid-cols-[0.85fr_1.15fr] lg:gap-10 xl:gap-[90px] py-11 sm:py-[55px] lg:py-[76px] mx-auto w-[calc(100%-32px)] max-w-7xl sm:w-[calc(100%-48px)] xl:w-[calc(100%-80px)]"
    >
      <div class="[&>p:last-of-type]:mt-5 [&>p:last-of-type]:max-w-[340px]">
        <p class="mb-[15px] flex items-center gap-[9px] text-[9px] leading-normal font-bold tracking-[1.3px] text-[#d2d8dc] sm:text-[11px] sm:tracking-[1.8px] [&>span]:pr-0.5 [&>span]:text-[17px] [&>span]:tracking-[-2px] [&>span]:text-accent [&>span]:italic">
          <span>//</span> {{ text.experienceLabel }}
        </p><h2 class="m-0 text-[32px] leading-[1.1] sm:text-[clamp(30px,3.6vw,46px)]">
          {{ text.experienceTitle }}
        </h2><p class="text-sm leading-[1.9] text-muted">
          {{ text.experienceIntro }}
        </p><div
          class="mt-10 hidden text-[90px] font-extrabold tracking-[-10px] text-white/2 [-webkit-text-stroke:1px_#63303a] lg:block"
          aria-hidden="true"
        >
          &lt;/&gt;
        </div>
      </div>
      <div class="pt-2.5">
        <article
          v-for="(item, index) in experience"
          :key="item.id"
          class="relative grid grid-cols-[16px_minmax(0,1fr)] gap-4 pb-[30px] before:absolute before:top-2.5 before:bottom-0 before:left-[7px] before:w-px before:bg-[#b62a42] before:content-[''] last:pb-0 last:before:hidden sm:grid-cols-[90px_16px_minmax(0,1fr)] sm:gap-[15px] sm:pb-[37px] sm:before:left-[112px] xl:grid-cols-[115px_20px_minmax(0,1fr)] xl:gap-[22px] xl:before:left-[146px] [&>div:last-child]:col-start-2 sm:[&>div:last-child]:col-start-auto [&_h3]:text-[15px] [&_h3]:font-semibold [&_p]:mt-2.5 [&_p]:text-xs [&_p]:leading-[1.8] [&_p]:text-[#94a1aa]"
        >
          <div class="col-start-2 text-[10px] font-semibold text-[#e67689] sm:col-start-auto sm:pt-[3px] sm:text-[9px] sm:text-[#b2bcc4] xl:text-[10px]">
            {{ period(item.startDate, item.endDate) }}
          </div><span class="absolute top-0 left-[3px] z-1 mt-[5px] size-2.5 justify-self-center rounded-full border-2 border-[#ff6076] bg-accent sm:relative sm:top-auto sm:left-auto" /><div><span class="mb-1.5 hidden text-[9px] tracking-[1px] text-[#c68491] sm:block">0{{ index + 1 }}</span><h3>{{ item.role }}</h3><span class="mt-[7px] block text-[11px] text-[#b9c1c7]">{{ item.company }}</span><p>{{ item.description }}</p></div>
        </article>
      </div>
    </section>

    <section
      v-if="portfolio?.profile"
      id="contact"
      data-reveal
      class="relative isolate mb-[45px] min-h-[470px] overflow-hidden rounded-lg border border-[#35282c] sm:mb-[65px] sm:min-h-[430px] mx-auto w-[calc(100%-32px)] max-w-7xl sm:w-[calc(100%-48px)] xl:w-[calc(100%-80px)]"
    >
      <img
        :src="assetPath(contactImage)"
        alt=""
        width="1600"
        height="900"
        loading="lazy"
        class="absolute inset-0 -z-3 size-full object-cover object-[57%_center] opacity-70 sm:object-[65%_center] sm:opacity-100"
      ><div class="absolute inset-0 -z-2 bg-[linear-gradient(90deg,#090c0ff2,#090c0d88)] sm:bg-[linear-gradient(90deg,#090c0ff2,#090c0fa6_45%,#090c0d00)]" />
      <div class="max-w-[620px] px-[23px] py-8 sm:p-[35px] lg:p-12 [&>h2]:text-[39px] sm:[&>h2]:text-[clamp(35px,4.5vw,61px)] [&_h2>span]:text-accent [&>p:last-of-type]:mt-5 [&>p:last-of-type]:max-w-[430px] [&>p:last-of-type]:text-xs [&>p:last-of-type]:leading-[1.8] [&>p:last-of-type]:text-[#b0bdc6] sm:[&>p:last-of-type]:text-[13px]">
        <p class="mb-[15px] flex items-center gap-[9px] text-[9px] leading-normal font-bold tracking-[1.3px] text-[#d2d8dc] sm:text-[11px] sm:tracking-[1.8px] [&>span]:pr-0.5 [&>span]:text-[17px] [&>span]:tracking-[-2px] [&>span]:text-accent [&>span]:italic">
          <span>//</span> {{ text.contactLabel }}
        </p><h2 class="m-0 text-[32px] leading-[1.1] sm:text-[clamp(30px,3.6vw,46px)]">
          {{ text.contactTitle }}<br><span>{{ text.contactAccent }}</span>
        </h2><p>{{ text.contactDescription }}</p><a
          :href="'mailto:' + portfolio.profile.email"
          class="mt-[25px] inline-flex items-center gap-[15px] text-[23px] font-semibold tracking-[-0.5px] sm:gap-6 sm:text-[25px] [&_.iconify]:text-accent"
        ><span class="min-w-0 wrap-anywhere">{{ portfolio.profile.email }}</span> <UIcon name="i-lucide-arrow-up-right" /></a><div class="mt-[26px] flex flex-col flex-wrap gap-4 sm:flex-row sm:gap-6 [&>a]:flex [&>a]:items-center [&>a]:gap-2 [&>a]:text-[11px] [&>a]:text-[#aab7c0] [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span]:text-[11px] [&>span]:text-[#aab7c0] [&_.iconify]:text-base [&_.iconify]:text-accent">
          <a :href="'mailto:' + portfolio.profile.email"><UIcon name="i-lucide-mail" /> {{ text.email }}</a><a
            :href="portfolio.profile.linkedinUrl"
            target="_blank"
            rel="noopener noreferrer"
          ><UIcon name="i-simple-icons-linkedin" /> LinkedIn</a>
        </div>
      </div>
      <UIcon
        name="i-lucide-move-up-right"
        class="absolute top-[55px] right-[25px] hidden text-[80px] text-white/7 sm:block lg:right-[65px] lg:text-[130px]"
        aria-hidden="true"
      />
    </section>
  </div>
</template>
