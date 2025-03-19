
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  keywords?: string[];
  author?: string;
  children?: React.ReactNode;
}

export const SEO = ({
  title = 'Secure 1-on-1 Chat Platform | Chatwii',
  description = 'Chat anonymously or with verified users on our secure platform. Private, end-to-end encrypted messaging for safe online conversations.',
  canonicalUrl = 'https://chatiwy.com/',
  ogImage = '/og-image.png',
  ogType = 'website',
  keywords = [
    'online chat', 
    'one to one chat', 
    'private chat', 
    'chat with strangers', 
    'secure anonymous chat', 
    'video chat', 
    'private messaging'
  ],
  author = 'Chatwii',
  children
}: SEOProps) => {
  const formattedKeywords = keywords.join(', ');
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={formattedKeywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      
      {children}
    </Helmet>
  );
};

export default SEO;
