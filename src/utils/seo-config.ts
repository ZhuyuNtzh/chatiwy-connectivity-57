
/**
 * SEO Configuration for the Chatwii website
 * This file centralizes SEO-related settings
 */

export const seoConfig = {
  // Default title and descriptions
  defaultTitle: 'Secure 1-on-1 Chat Platform | Chatwii',
  defaultDescription: 'Chat anonymously or with verified users on our secure platform. Private, end-to-end encrypted messaging for safe online conversations.',
  
  // Primary keywords
  primaryKeywords: [
    'online chat',
    'one to one chat',
    'private chat',
    'chat with strangers',
    'video chat platform',
    'secure anonymous chat',
    'private messaging app',
    'chat with verified users',
    'anonymous chat platform'
  ],
  
  // Page-specific SEO settings
  pages: {
    home: {
      title: 'Secure 1-on-1 Chat Platform | Chatwii',
      description: 'Chat anonymously or with verified users on our secure platform. Private, end-to-end encrypted messaging for safe online conversations.',
      keywords: ['online chat', 'anonymous chat', 'private chat', 'secure messaging'],
      priority: 1.0
    },
    vipMembership: {
      title: 'VIP Membership Benefits | Chatwii',
      description: 'Upgrade to VIP for premium features like unlimited media sharing, voice messages, and exclusive chat options.',
      keywords: ['premium chat', 'VIP messaging', 'unlimited chat features'],
      priority: 0.8
    },
    chatInterface: {
      title: 'Private One-on-One Chat | Chatwii',
      description: 'Start a secure, private conversation with users from around the world. End-to-end encryption protects your privacy.',
      keywords: ['private chat', 'secure conversation', 'one-on-one messaging'],
      priority: 0.9
    },
    // Add more pages as needed
  },
  
  // Social media profiles for Schema.org markup
  socialProfiles: {
    twitter: 'https://twitter.com/chatwii',
    facebook: 'https://facebook.com/chatwii',
    instagram: 'https://instagram.com/chatwii',
    linkedin: 'https://linkedin.com/company/chatwii'
  },
  
  // Organization Schema.org data
  organization: {
    name: 'Chatwii',
    logo: 'https://chatiwy.com/logo.png',
    foundingDate: '2023',
    description: 'Secure private chat platform for anonymous and verified conversations online.'
  }
};

export default seoConfig;
