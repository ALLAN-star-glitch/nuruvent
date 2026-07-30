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
    description: 'Homepage - Events Marketplace'
  },
  {
    path: '/events',
    priority: 0.9,
    changeFrequency: 'daily',
    description: 'All training events'
  },
  {
    path: '/how-it-works',
    priority: 0.8,
    changeFrequency: 'monthly',
    description: 'How Nuruvent works'
  },
  {
    path: '/features',
    priority: 0.8,
    changeFrequency: 'monthly',
    description: 'Platform features'
  },
  {
    path: '/pricing',
    priority: 0.8,
    changeFrequency: 'weekly',
    description: 'Pricing plans'
  },
  {
    path: '/for-hosts',
    priority: 0.7,
    changeFrequency: 'monthly',
    description: 'Information for event hosts'
  },
  {
    path: '/help',
    priority: 0.6,
    changeFrequency: 'monthly',
    description: 'Help and support'
  },
  {
    path: '/signup',
    priority: 0.7,
    changeFrequency: 'weekly',
    description: 'Sign up page'
  },
  {
    path: '/signin',
    priority: 0.7,
    changeFrequency: 'weekly',
    description: 'Sign in page'
  },
  {
    path: '/forgot-password',
    priority: 0.5,
    changeFrequency: 'weekly',
    description: 'Forgot password'
  },
]

// Dynamic event routes (fetch from your API)
async function getEventSlugs(): Promise<string[]> {
  // TODO: Replace with actual API call to fetch all event slugs
  try {
    // Example: fetch from your backend API
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/slugs`, {
    //   next: { revalidate: 3600 } // Cache for 1 hour
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
      url: `${baseUrl}/events?category=ngos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/events?category=corporate`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/events?category=government`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
  ]

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
    ...eventRoutes,
    ...hostRoutes,
  ]

  // Sort by priority (highest first)
  routes.sort((a, b) => (b.priority || 0) - (a.priority || 0))

  return routes
}