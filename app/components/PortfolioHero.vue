<script setup lang="ts">
import portrait from '~/assets/image/developer-anime-v2.png'
import { assetPath } from '~/utils/assetPath'

const { locale, text } = usePortfolioLocale()
const { data: content } = await usePortfolioContent()
const portfolio = computed(() => content.value?.data)
const isCvNoticeOpen = ref(false)
</script>

<template>
  <section
    class="relative isolate min-h-[775px] overflow-hidden border-y border-t-0 border-[#263038] bg-[radial-gradient(ellipse_at_68%_44%,#220a0f_0,#080b0e_55%)] sm:min-h-[630px] sm:border-x lg:min-h-[720px]"
    aria-labelledby="hero-title"
  >
    <p class="absolute top-5 left-[21px] z-3 text-[8px] leading-normal font-bold text-[#ff3948] sm:top-[23px] sm:left-[30px] sm:text-[10px] [&>span]:block [&>span]:text-[9px] [&>span]:font-normal [&>span]:tracking-[0.9px] [&>span]:text-[#a4aab1]">
      WEB DEVELOPER <span>DIGITAL CREATOR</span>
    </p>
    <span
      class="absolute top-[63px] right-3.5 left-3.5 -z-2 bg-linear-to-b from-[#ff2639] from-14% via-[#bd1021] via-60% to-[#310811] bg-clip-text font-display text-[18vw] leading-[0.95] font-black tracking-[-2px] text-transparent sm:top-[62px] sm:left-[21px] sm:tracking-[-3px] lg:top-[50px] lg:text-[17.5vw] lg:tracking-[-6px] xl:text-[clamp(110px,17.1vw,240px)]"
      aria-hidden="true"
    >PORTFOLIO</span>
    <img
      data-float
      :src="assetPath(portrait)"
      alt=""
      width="1024"
      height="1536"
      class="absolute top-[70px] right-[-17%] bottom-0 -z-1 h-[69%] w-[98%] object-cover object-[center_2%] opacity-[0.83] [mask-image:linear-gradient(90deg,transparent,black_25%,black_90%),linear-gradient(0deg,transparent,black_40%)] [mask-composite:intersect] sm:top-auto sm:right-[-7%] sm:h-[93%] sm:w-4/5 sm:opacity-85 sm:[mask-image:linear-gradient(90deg,transparent,black_18%,black_85%,transparent)] sm:[mask-composite:add] lg:top-14  lg:right-[3%] lg:w-[68%] lg:opacity-100 xl:right-[7%] xl:w-[65%]"
      fetchpriority="high"
    >
    <div
      data-reveal
      class="relative z-2 w-full px-[22px] pt-[236px] pb-[25px] sm:w-[310px] sm:pt-[235px] sm:pb-[35px] sm:pl-[26px] lg:w-[330px] lg:pt-[233px] xl:w-[365px] xl:pt-[290px] xl:pl-[31px]"
    >
      <p
        class="mb-[7px] font-hand leading-[1.3] text-[#ffdadd] italic origin-left -rotate-5 text-[30px] md:text-[38px]"
      >
        {{ locale === 'id' ? 'Halo, Saya' : 'Hello, I’m' }}
      </p>
      <h1
        id="hero-title"
        class="m-0 font-display leading-[1.05] font-black tracking-[-0.5px] text-[#f4f4f3] [text-shadow:1px_2px_10px_#0005]"
      >
        <span class="block text-[clamp(32px,10vw,48px)] leading-[1.05] whitespace-nowrap sm:text-[40px] xl:text-5xl">WEB DEVELOPER</span>
      </h1>
      <p
        data-typewriter
        class="mt-3.5 mb-4 text-base leading-[1.2] font-extrabold tracking-[-0.4px] text-[#ff243d] sm:mt-4 sm:text-lg"
      >
        {{ portfolio?.profile?.role || 'WEB DEVELOPER & UI/UX CREATOR' }}
      </p>
      <p class="mt-[18px] max-w-[230px] text-xs leading-[1.65] text-[#c1c7ce] sm:mt-[15px] sm:max-w-[310px] sm:text-[13px]">
        {{ portfolio?.profile?.summary || text.heroDescription }}
      </p>
      <div class="mt-[22px] flex gap-[9px] sm:mt-[23px] sm:gap-3 [&>a]:min-h-11 [&>a]:rounded-md [&>a]:border [&>a]:border-[#ff4d52] [&>a]:bg-linear-145 [&>a]:from-[#ff473f] [&>a]:to-[#f11e36] [&>a]:px-[13px] [&>a]:py-[11px] [&>a]:text-[10px] [&>a]:font-bold [&>a]:text-white [&>button]:min-h-11 [&>button]:rounded-md [&>button]:border [&>button]:border-[#58616a] [&>button]:bg-[#0b0e13d9] [&>button]:px-[13px] [&>button]:py-[11px] [&>button]:text-[10px] [&>button]:font-bold [&>button]:text-[#eee] sm:[&>a]:min-h-[43px] sm:[&>a]:px-[15px] sm:[&>a]:text-[11px] sm:[&>button]:min-h-[43px] sm:[&>button]:px-[15px] sm:[&>button]:text-[11px]">
        <UButton
          :to="'/' + locale + '/projects'"
          color="primary"
          trailing-icon="i-lucide-arrow-up-right"
        >
          {{ text.seeProjects }}
        </UButton>
        <UButton
          :to="portfolio?.resume?.downloadUrl"
          external
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-download"
          :aria-expanded="isCvNoticeOpen"
          @click="!portfolio?.resume && (isCvNoticeOpen = !isCvNoticeOpen)"
        >
          {{ text.cv }}
        </UButton>
      </div>
      <p
        v-if="isCvNoticeOpen"
        class="mt-[13px] max-w-[280px] text-[11px] leading-[1.6] text-[#f4b3bf]"
        role="status"
      >
        {{ text.cvUnavailable }}
      </p>
      <p class="mt-5 flex max-w-[255px] items-center gap-[9px] text-[7px] tracking-[0.6px] text-[#9ba3af] sm:mt-[25px] sm:max-w-none sm:text-[8px]">
        <span class="motion-safe:animate-pulse size-1.5 shrink-0 rounded-full border border-accent" />{{ locale === 'id' ? 'MEMBANGUN IDE MENJADI PENGALAMAN DIGITAL' : 'TURNING IDEAS INTO DIGITAL EXPERIENCES' }}
      </p>
    </div>
    <div
      data-reveal
      class="absolute right-[22px] bottom-5 left-[22px] z-2 sm:right-5 sm:left-auto sm:w-[105px] lg:top-[210px] lg:right-[19px] lg:bottom-auto lg:w-[118px] xl:top-[225px] xl:right-[25px] xl:w-[145px] [&>p]:hidden [&>p]:max-w-[130px] [&>p]:text-[9px] [&>p]:leading-[1.6] [&>p]:text-[#d2c5c9] lg:[&>p]:block"
    >
      <p>{{ locale === 'id' ? 'MENGUBAH IDE MENJADI PENGALAMAN DIGITAL YANG BERMAKNA.' : 'TURNING IDEAS INTO MEANINGFUL DIGITAL EXPERIENCES.' }}</p>
      <div
        class="mt-[25px] hidden size-[54px] place-items-center rounded-full border border-[#ac6573] text-[#e3c4cb] lg:grid [&>span]:relative [&>span]:h-px [&>span]:w-6 [&>span]:bg-current [&>span]:before:absolute [&>span]:before:-top-3 [&>span]:before:left-3 [&>span]:before:h-[25px] [&>span]:before:w-px [&>span]:before:bg-current [&>span]:before:content-['']"
        aria-hidden="true"
      >
        <span />
      </div>
      <dl class="flex justify-between border-t border-[#363039] sm:block sm:border-t-0 sm:border-l sm:border-l-[#292d35] sm:bg-[#080b0ed9] sm:pl-2.5 lg:mt-[23px] xl:pl-[18px] [&>div]:flex [&>div]:flex-1 [&>div]:flex-col [&>div]:items-start [&>div]:gap-1.5 [&>div]:border-l [&>div]:border-l-[#29232b] [&>div]:px-2 [&>div]:pt-4 [&>div:first-child]:border-l-0 [&>div:first-child]:pl-0 sm:[&>div]:flex-row sm:[&>div]:items-center sm:[&>div]:gap-2.5 sm:[&>div]:border-b sm:[&>div]:border-b-[#28232b] sm:[&>div]:border-l-0 sm:[&>div]:px-0 sm:[&>div]:py-3 sm:[&>div:last-child]:border-b-0 lg:[&>div]:py-[19px] xl:[&>div]:gap-[17px] [&_dt]:font-display [&_dt]:text-[27px] [&_dt]:text-[#ff263e] sm:[&_dt]:min-w-[43px] sm:[&_dt]:text-[30px] lg:[&_dt]:text-4xl [&>div:last-child_dt]:text-2xl sm:[&>div:last-child_dt]:text-[25px] [&_dd]:text-[7px] [&_dd]:leading-normal [&_dd]:text-[#b0b7c2] sm:[&_dd]:max-w-[70px] lg:[&_dd]:text-[8px]">
        <div><dt>{{ String(portfolio?.projects.meta.total ?? 0).padStart(2, '0') }}</dt><dd>{{ locale === 'id' ? 'PROYEK PILIHAN' : 'SELECTED PROJECTS' }}</dd></div>
        <div><dt>{{ String(portfolio?.skills.length ?? 0).padStart(2, '0') }}</dt><dd>{{ locale === 'id' ? 'TEKNOLOGI UTAMA' : 'CORE TECHNOLOGIES' }}</dd></div>
        <div><dt>ID/EN</dt><dd>{{ locale === 'id' ? 'DUA BAHASA' : 'TWO LANGUAGES' }}</dd></div>
      </dl>
    </div>
    <span
      class="absolute right-0 bottom-0 z-0 hidden h-[125px] w-[180px] bg-[linear-gradient(#ffffff0b_1px,transparent_1px),linear-gradient(90deg,#ffffff0b_1px,transparent_1px)] bg-size-[30px_30px] [mask-image:linear-gradient(135deg,transparent,black)] sm:block"
      aria-hidden="true"
    />
  </section>
</template>
