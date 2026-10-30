import { messages } from '~/data/portfolio'
import type { Locale } from '~/data/portfolio'

export function usePortfolioLocale() {
  const route = useRoute()
  const locale = computed<Locale>(() => route.params.locale === 'en' ? 'en' : 'id')
  const text = computed(() => messages[locale.value])

  function localePath(language: Locale) {
    return route.fullPath.replace(/^\/(id|en)(?=\/|\?|#|$)/, '/' + language)
  }

  const config = useRuntimeConfig()
  useHead(() => ({
    htmlAttrs: { lang: locale.value },
    link: [
      { rel: 'canonical', href: new URL(route.path, config.public.siteUrl).href },
      ...(['id', 'en'] as const).map(language => ({ rel: 'alternate' as const, hreflang: language, href: new URL(route.path.replace(/^\/(id|en)(?=\/|$)/, '/' + language), config.public.siteUrl).href }))
    ]
  }))
  return { locale, text, localePath }
}
