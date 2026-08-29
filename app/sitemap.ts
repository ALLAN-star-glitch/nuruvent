import { MetadataRoute } from 'next'

// Base URL - using your actual domain
const baseUrl = 'https://nuruvent.com'

// Define page types with their priority and change frequency
type PageConfig = {
  path: string
  priority: number
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  description?: string
}

// Static pages configuration
const staticPages: PageConfig[] = [
  {
    path: '',
    priority: 1.0,
    changeFrequency: 'daily',
    description: 'Homepage - Nuruvent — Where Professionals Grow'
  },
  {
    path: '/events',
    priority: 0.9,
    changeFrequency: 'daily',
    description: 'All training events — workshops, webinars, bootcamps, meetups'
  },
  {
    path: '/how-it-works',
    priority: 0.8,
    changeFrequency: 'monthly',
    description: 'How Nuruvent works — for training hosts and attendees'
  },
  {
    path: '/pricing',
    priority: 0.8,
    changeFrequency: 'weekly',
    description: 'Transparent pricing — free events, paid tickets, certificates, storage'
  },
  {
    path: '/signup',
    priority: 0.7,
    changeFrequency: 'weekly',
    description: 'Sign up to Nuruvent — start hosting or attending training events'
  },
  {
    path: '/signin',
    priority: 0.7,
    changeFrequency: 'weekly',
    description: 'Sign in to your Nuruvent account'
  },
  {
    path: '/forgot-password',
    priority: 0.5,
    changeFrequency: 'weekly',
    description: 'Reset your Nuruvent password'
  },
]

// Dynamic event routes (fetch from your API)
async function getEventSlugs(): Promise<string[]> {
  // TODO: Replace with actual API call to fetch all event slugs
  try {
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/slugs`, {
    //   next: { revalidate: 3600 }
    // })
    // const data = await response.json()
    // return data.slugs || []
    return []
  } catch (error) {
    console.error('Error fetching event slugs:', error)
    return []
  }
}

// Dynamic host routes (fetch from your API)
async function getHostSlugs(): Promise<string[]> {
  // TODO: Replace with actual API call to fetch all host slugs
  try {
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hosts/slugs`)
    // const data = await response.json()
    // return data.slugs || []
    return []
  } catch (error) {
    console.error('Error fetching host slugs:', error)
    return []
  }
}

// Dynamic category slugs (fetch from your API)
async function getCategorySlugs(): Promise<string[]> {
  // TODO: Replace with actual API call to fetch all category slugs
  try {
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/slugs`)
    // const data = await response.json()
    // return data.slugs || []
    return []
  } catch (error) {
    console.error('Error fetching category slugs:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  // Category filter routes
  const categoryRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/events?category=workshops`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/events?category=webinars`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/events?category=bootcamps`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/events?category=meetups`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/events?category=training-institutes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/events?category=professional-bodies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/events?category=universities`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/events?category=corporate-hr`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/events?category=individual-trainers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/events?category=coaches`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/events?category=ngos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/events?category=government`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/events?category=free`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/events?category=paid`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/events?category=virtual`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/events?category=in-person`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/events?category=hybrid`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
  ]

  // Dynamic category routes (for category pages)
  const categorySlugs = await getCategorySlugs()
  const categoryPageRoutes: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${baseUrl}/categories/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  // Dynamic event routes
  const eventSlugs = await getEventSlugs()
  const eventRoutes: MetadataRoute.Sitemap = eventSlugs.map((slug) => ({
    url: `${baseUrl}/events/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Dynamic host/organization routes
  const hostSlugs = await getHostSlugs()
  const hostRoutes: MetadataRoute.Sitemap = hostSlugs.map((slug) => ({
    url: `${baseUrl}/hosts/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  // Combine all routes
  const routes = [
    ...staticRoutes,
    ...categoryRoutes,
    ...categoryPageRoutes,
    ...eventRoutes,
    ...hostRoutes,
  ]

  // Remove duplicates (based on URL)
  const uniqueRoutes = routes.filter(
    (route, index, self) => index === self.findIndex((r) => r.url === route.url)
  )

  // Sort by priority (highest first)
  uniqueRoutes.sort((a, b) => (b.priority || 0) - (a.priority || 0))

  return uniqueRoutes
}