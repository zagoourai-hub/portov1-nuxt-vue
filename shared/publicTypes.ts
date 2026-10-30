export interface PublicProfile { name: string, email: string, linkedinUrl: string, role: string, summary: string, photoAlt: string, photoUrl: string | null }
export interface PublicProject { id: string, slug: string, title: string, summary: string, technologies: string[], featured: boolean, position: number, cover: { url: string, alt: string } | null }
export interface PublicProjectDetail extends Omit<PublicProject, 'featured' | 'position' | 'cover'> { role: string, outcome: string, demoUrl: string | null, repositoryUrl: string | null, images: { url: string, alt: string }[] }
export interface PublicExperience { id: string, company: string, startDate: string, endDate: string | null, role: string, description: string }
export interface PublicPortfolio {
  profile: PublicProfile | null
  projects: { data: PublicProject[], meta: { total: number } }
  experiences: { data: PublicExperience[], meta: { total: number } }
  skills: { id: string, name: string, position: number }[]
  resume: { downloadUrl: string } | null
}
