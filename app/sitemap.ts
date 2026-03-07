import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://photo-site-urs8.vercel.app"

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/category/landscape`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/category/night`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/category/nature`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/category/people`,
      lastModified: new Date(),
    },
  ]
}