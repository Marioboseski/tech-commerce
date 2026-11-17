type CategoryMeta = {
  tagline: string;
  icon: string;
  image: string | null;
};

const categoryMeta: Record<string, CategoryMeta> = {
  laptops: {
    tagline: 'Portable power for work and study',
    icon: '💻',
    image: '/categories/laptops.webp',
  },
  'mobile-phones': {
    tagline: 'Stay connected in style',
    icon: '📱',
    image: '/categories/mobile-phones.webp',
  },
  computers: {
    tagline: 'Strong performance for your setup',
    icon: '🖥️',
    image: '/categories/computers.webp',
  },
  consoles: {
    tagline: 'Gaming for every player',
    icon: '🎮',
    image: '/categories/consoles.webp',
  },
  tablets: {
    tagline: 'Flexible devices for everyday use',
    icon: '📟',
    image: '/categories/tablets.webp',
  },
};

// A category added later without its own meta still works (no picture).
const defaultMeta: CategoryMeta = { tagline: '', icon: '🛍️', image: null };

export const getCategoryMeta = (slug: string) =>
  categoryMeta[slug] ?? defaultMeta;
