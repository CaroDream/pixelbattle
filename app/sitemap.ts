import type { MetadataRoute } from 'next';

const baseUrl = 'https://pixelbattle-nine.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: baseUrl, lastModified: now, changeFrequency: 'hourly', priority: 1 },
    { url: `${baseUrl}/leaderboard`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/teams`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/missions`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/how-to-play`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ];
}
