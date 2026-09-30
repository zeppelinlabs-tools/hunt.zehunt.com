import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

interface ProblemItem {
  id: number;
  created_at?: string;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hunt.zehunt.com';

  // Core static landing and platform routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/solutions`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/topics`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/stacks`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic problem investigation routes
  let problemRoutes: MetadataRoute.Sitemap = [];
  try {
    const problemsFile = path.join(process.cwd(), 'data', 'problems.json');
    if (fs.existsSync(problemsFile)) {
      const problems: ProblemItem[] = JSON.parse(fs.readFileSync(problemsFile, 'utf-8'));
      problemRoutes = problems.map((p) => ({
        url: `${baseUrl}/problems/${p.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.85,
      }));
    }
  } catch {
    // Graceful fallback
  }

  return [...staticRoutes, ...problemRoutes];
}
