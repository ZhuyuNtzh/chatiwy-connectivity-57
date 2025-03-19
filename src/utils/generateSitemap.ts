
import fs from 'fs';
import path from 'path';

interface SitemapURL {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate a sitemap.xml file to help search engines index the site
 * @param urls Array of URL objects with metadata
 * @param domain The base domain of the website
 * @param outputPath Path to write the sitemap file
 */
export const generateSitemap = (
  urls: SitemapURL[],
  domain: string = 'https://chatiwy.com',
  outputPath: string = './public/sitemap.xml'
): void => {
  // Ensure domain does not end with a slash
  const baseDomain = domain.endsWith('/') ? domain.slice(0, -1) : domain;
  
  // Create XML string
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add each URL to the sitemap
  urls.forEach(({ url, lastmod, changefreq, priority }) => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseDomain}${url.startsWith('/') ? url : '/' + url}</loc>\n`;
    
    if (lastmod) {
      sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
    }
    
    if (changefreq) {
      sitemap += `    <changefreq>${changefreq}</changefreq>\n`;
    }
    
    if (priority !== undefined) {
      sitemap += `    <priority>${priority}</priority>\n`;
    }
    
    sitemap += '  </url>\n';
  });
  
  sitemap += '</urlset>';
  
  // Ensure the directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write the sitemap file
  fs.writeFileSync(outputPath, sitemap);
  console.log(`Sitemap generated at ${outputPath}`);
};

// Example usage (can be run during build process)
// This can be called from a build script or server-side code
export const generateChatwiiSitemap = () => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const urls: SitemapURL[] = [
    { url: '/', lastmod: today, changefreq: 'weekly', priority: 1.0 },
    { url: '/vip-membership', lastmod: today, changefreq: 'monthly', priority: 0.8 },
    { url: '/login', lastmod: today, changefreq: 'monthly', priority: 0.7 },
    { url: '/profile-setup', lastmod: today, changefreq: 'monthly', priority: 0.7 },
    { url: '/chat-interface', lastmod: today, changefreq: 'daily', priority: 0.9 },
    { url: '/chat-history', lastmod: today, changefreq: 'weekly', priority: 0.6 },
    { url: '/feedback', lastmod: today, changefreq: 'monthly', priority: 0.5 },
    { url: '/settings', lastmod: today, changefreq: 'monthly', priority: 0.5 },
  ];
  
  generateSitemap(urls);
};
