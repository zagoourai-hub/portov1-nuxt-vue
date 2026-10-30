import type { PublicPortfolio } from '~~/shared/publicTypes'

export function usePortfolioContent() {
  const { locale } = usePortfolioLocale()
  return useFetch<{ data: PublicPortfolio }>('/api/public/portfolio', { query: { locale }, key: computed(() => 'portfolio-' + locale.value) })
}
