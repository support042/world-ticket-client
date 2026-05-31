import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const DEFAULT_TITLE = 'World Ticket | Buy & Sell Tickets for Global Events';
const DEFAULT_DESCRIPTION = 'The most secure platform to buy and sell tickets for the World Cup 2026 and other major global events.';

export default function SEO({ title, description, keywords }: SEOProps) {
  useEffect(() => {
    // Update Title
    document.title = title ? `${title} | World Ticket` : DEFAULT_TITLE;

    // Update Description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || DEFAULT_DESCRIPTION);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description || DEFAULT_DESCRIPTION;
      document.head.appendChild(meta);
    }

    // Update Keywords if provided
    if (keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'keywords';
        meta.content = keywords;
        document.head.appendChild(meta);
      }
    }
  }, [title, description, keywords]);

  return null;
}
