// Presentation-only data that is not stored in the database.
const categoryMeta: Record<string, { tagline: string; icon: string }> = {
  laptops: { tagline: 'Portable power for work and study', icon: '💻' },
  'mobile-phones': { tagline: 'Stay connected in style', icon: '📱' },
  computers: { tagline: 'Strong performance for your setup', icon: '🖥️' },
  consoles: { tagline: 'Gaming for every player', icon: '🎮' },
  tablets: { tagline: 'Flexible devices for everyday use', icon: '📟' },
};

const defaultMeta = { tagline: '', icon: '🛍️' };

export const getCategoryMeta = (slug: string) =>
  categoryMeta[slug] ?? defaultMeta;
