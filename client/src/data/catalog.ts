export type CategoryName =
  'Laptops' | 'Smartphones' | 'Tablets' | 'Desktops' | 'Accessories';

export type Category = 'All' | CategoryName;

export type Product = {
  id: number;
  name: string;
  category: CategoryName;
  price: number;
  description: string;
  badge: string;
  rating: string;
  icon: string;
  image: string;
};

export type CatalogCategory = {
  name: CategoryName;
  tagline: string;
  icon: string;
  image: string;
};

export const categories: CatalogCategory[] = [
  {
    name: 'Laptops',
    tagline: 'Portable power for work and study',
    icon: '💻',
    image: '/products/novabook-air.jpg',
  },
  {
    name: 'Smartphones',
    tagline: 'Stay connected in style',
    icon: '📱',
    image: '/products/apex-pro.jpg',
  },
  {
    name: 'Tablets',
    tagline: 'Flexible devices for everyday use',
    icon: '📟',
    image: '/products/slatepad.jpg',
  },
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

export const products: Product[] = [
  {
    id: 1,
    name: 'NovaBook Air 14',
    category: 'Laptops',
    price: 899,
    description:
      'Lightweight everyday laptop with a crisp display and long battery life.',
    badge: 'New',
    rating: '4.8',
    icon: '💻',
    image: '/products/novabook-air.jpg',
  },
  {
    id: 2,
    name: 'Apex Pro X',
    category: 'Smartphones',
    price: 699,
    description:
      'Balanced flagship phone with smooth performance and elegant camera design.',
    badge: 'Popular',
    rating: '4.7',
    icon: '📱',
    image: '/products/apex-pro.jpg',
  },
  {
    id: 3,
    name: 'SlatePad 11',
    category: 'Tablets',
    price: 469,
    description:
      'Portable tablet suited for browsing, drawing and video calls.',
    badge: 'Top rated',
    rating: '4.6',
    icon: '📟',
    image: '/products/slatepad.jpg',
  },
  {
    id: 4,
    name: 'StudioDesk One',
    category: 'Desktops',
    price: 1249,
    description:
      'All-in-one desktop for productivity, meetings and creative work.',
    badge: 'Featured',
    rating: '4.9',
    icon: '🖥️',
    image: '/products/studiodesk.jpg',
  },
  {
    id: 5,
    name: 'WavePods Max',
    category: 'Accessories',
    price: 229,
    description:
      'Comfortable wireless headphones with immersive audio and clean design.',
    badge: 'Best seller',
    rating: '4.8',
    icon: '🎧',
    image: '/products/wavepods.jpg',
  },
  {
    id: 6,
    name: 'OrbitBook 16',
    category: 'Laptops',
    price: 1349,
    description:
      'Larger display and fast internals for multitasking and content creation.',
    badge: 'Pro',
    rating: '4.9',
    icon: '💻',
    image: '/products/orbitbook.jpg',
  },
  {
    id: 7,
    name: 'Pixelon Mini',
    category: 'Smartphones',
    price: 549,
    description:
      'Compact smartphone with stylish finish and dependable battery life.',
    badge: 'Compact',
    rating: '4.5',
    icon: '📱',
    image: '/products/pixelon-mini.jpg',
  },
  {
    id: 8,
    name: 'Focus Tab 10',
    category: 'Tablets',
    price: 389,
    description:
      'Slim tablet for reading, light note-taking and entertainment.',
    badge: 'Everyday',
    rating: '4.4',
    icon: '📟',
    image: '/products/focus-tab.jpg',
  },
  {
    id: 9,
    name: 'Tower Core S',
    category: 'Desktops',
    price: 999,
    description: 'Desktop tower built for a reliable home office workstation.',
    badge: 'Essential',
    rating: '4.6',
    icon: '🖥️',
    image: '/products/tower-core.jpg',
  },
  {
    id: 10,
    name: 'KeyPad Studio',
    category: 'Accessories',
    price: 129,
    description:
      'Minimal keyboard accessory with clean lines and tactile comfort.',
    badge: 'Clean setup',
    rating: '4.5',
    icon: '⌨️',
    image: '/products/keypad.jpg',
  },
  {
    id: 11,
    name: 'MouseFlow Pro',
    category: 'Accessories',
    price: 79,
    description: 'Ergonomic wireless mouse designed for all-day use.',
    badge: 'Desk gear',
    rating: '4.4',
    icon: '🖱️',
    image: '/products/mouseflow.jpg',
  },
  {
    id: 12,
    name: 'PocketSound Lite',
    category: 'Accessories',
    price: 99,
    description: 'Compact earbuds that fit a modern mobile lifestyle.',
    badge: 'Audio',
    rating: '4.3',
    icon: '🎧',
    image: '/products/pocketsound.jpg',
  },
];
