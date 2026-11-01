export type Category =
  'All' | 'Laptops' | 'Smartphones' | 'Tablets' | 'Desktops' | 'Accessories';
export type Product = {
  id: number;
  name: string;
  category: Exclude<Category, 'All'>;
  price: number;
  description: string;
  badge: string;
  rating: string;
  icon: string;
  image: string;
};
export const categories: {
  name: Exclude<Category, 'All'>;
  tagline: string;
  icon: string;
  image: string;
}[] = [
  { name: 'Laptops', tagline: 'Portable power for work and study', icon: '💻', image: '/products/novabook-air.jpg' },
  { name: 'Smartphones', tagline: 'Stay connected in style', icon: '📱', image: '/products/apex-pro.jpg' },
  { name: 'Tablets', tagline: 'Flexible devices for everyday use', icon: '📟', image: '/products/slatepad.jpg' },
  {
    name: 'Desktops',
    tagline: 'Strong performance for your setup',
    icon: '🖥️',
    image: '/products/studiodesk.jpg',
  },
  {
    name: 'Accessories',
    tagline: 'The finishing touches for every desk',
    icon: '🎧',
    image: '/products/wavepods.jpg',
  },
];
const productImages: Record<number, string> = {
  1: '/products/novabook-air.jpg',
  2: '/products/apex-pro.jpg',
  3: '/products/slatepad.jpg',
  4: '/products/studiodesk.jpg',
  5: '/products/wavepods.jpg',
  6: '/products/orbitbook.jpg',
  7: '/products/pixelon-mini.jpg',
  8: '/products/focus-tab.jpg',
  9: '/products/tower-core.jpg',
  10: '/products/keypad.jpg',
  11: '/products/mouseflow.jpg',
  12: '/products/pocketsound.jpg',
};
export const products: Product[] = [
  [
    1,
    'NovaBook Air 14',
    'Laptops',
    899,
    'Lightweight everyday laptop with a crisp display and long battery life.',
    'New',
    '4.8',
    '💻',
  ],
  [
    2,
    'Apex Pro X',
    'Smartphones',
    699,
    'Balanced flagship phone with smooth performance and elegant camera design.',
    'Popular',
    '4.7',
    '📱',
  ],
  [
    3,
    'SlatePad 11',
    'Tablets',
    469,
    'Portable tablet suited for browsing, drawing and video calls.',
    'Top rated',
    '4.6',
    '📟',
  ],
  [
    4,
    'StudioDesk One',
    'Desktops',
    1249,
    'All-in-one desktop for productivity, meetings and creative work.',
    'Featured',
    '4.9',
    '🖥️',
  ],
  [
    5,
    'WavePods Max',
    'Accessories',
    229,
    'Comfortable wireless headphones with immersive audio and clean design.',
    'Best seller',
    '4.8',
    '🎧',
  ],
  [
    6,
    'OrbitBook 16',
    'Laptops',
    1349,
    'Larger display and fast internals for multitasking and content creation.',
    'Pro',
    '4.9',
    '💻',
  ],
  [
    7,
    'Pixelon Mini',
    'Smartphones',
    549,
    'Compact smartphone with stylish finish and dependable battery life.',
    'Compact',
    '4.5',
    '📱',
  ],
  [
    8,
    'Focus Tab 10',
    'Tablets',
    389,
    'Slim tablet for reading, light note-taking and entertainment.',
    'Everyday',
    '4.4',
    '📟',
  ],
  [
    9,
    'Tower Core S',
    'Desktops',
    999,
    'Desktop tower built for a reliable home office workstation.',
    'Essential',
    '4.6',
    '🖥️',
  ],
  [
    10,
    'KeyPad Studio',
    'Accessories',
    129,
    'Minimal keyboard accessory with clean lines and tactile comfort.',
    'Clean setup',
    '4.5',
    '⌨️',
  ],
  [
    11,
    'MouseFlow Pro',
    'Accessories',
    79,
    'Ergonomic wireless mouse designed for all-day use.',
    'Desk gear',
    '4.4',
    '🖱️',
  ],
  [
    12,
    'PocketSound Lite',
    'Accessories',
    99,
    'Compact earbuds that fit a modern mobile lifestyle.',
    'Audio',
    '4.3',
    '🎧',
  ],
].map(
  ([id, name, category, price, description, badge, rating, icon]) =>
    ({
      id,
      name,
      category,
      price,
      description,
      badge,
      rating,
      icon,
      image: productImages[id as number],
    }) as Product,
);

export const money = (value: number) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
