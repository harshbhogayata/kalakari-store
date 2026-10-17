// Journal articles shown on /journal. Shared with JournalDetail so "Read more" still
// opens an article when the journal collection in the database is empty.
// Images are served from /public so they cannot disappear like hot-linked stock photos did.

export interface LocalJournalPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  featured: boolean;
}

export const journalPosts: LocalJournalPost[] = [
  {
    id: 1,
    title: 'The Ancient Art of Block Printing',
    excerpt: 'Explore the history and intricate process behind one of India\'s most beloved textile traditions.',
    image: '/images/journal/block_printing.webp',
    category: 'TEXTILES',
    date: '2024-01-15',
    readTime: '5 min read',
    featured: true
  },
  {
    id: 2,
    title: 'A Day with the Meenakari Masters',
    excerpt: 'We sit down with a family that has been practicing the art of enamel jewelry for five generations.',
    image: '/images/journal/meenakari.webp',
    category: 'BEHIND THE CRAFT',
    date: '2024-01-10',
    readTime: '7 min read',
    featured: false
  },
  {
    id: 3,
    title: 'Pichwai: The Divine Paintings of Nathdwara',
    excerpt: 'Discover the spiritual significance and detailed artistry of these stunning cloth paintings.',
    image: '/images/journal/pichwai.webp',
    category: 'ART FORM',
    date: '2024-01-05',
    readTime: '6 min read',
    featured: false
  },
  {
    id: 4,
    title: 'The Craft of Kalamkari: Storytelling Through Cloth',
    excerpt: 'Understanding the traditional pen work and natural dyeing techniques of this ancient art form.',
    image: '/images/products/painting_traditional.webp',
    category: 'TEXTILES',
    date: '2024-01-01',
    readTime: '8 min read',
    featured: false
  },
  {
    id: 5,
    title: 'Wood Carving Traditions of Rajasthan',
    excerpt: 'A journey through the intricate woodwork that adorns palaces and temples across Rajasthan.',
    image: '/images/products/wood_carved_table.webp',
    category: 'WOODWORK',
    date: '2023-12-28',
    readTime: '6 min read',
    featured: false
  },
  {
    id: 6,
    title: 'The Art of Terracotta: From Clay to Masterpiece',
    excerpt: 'Exploring the traditional techniques and modern innovations in terracotta craftsmanship.',
    image: '/images/products/pottery_terracotta_vase.webp',
    category: 'POTTERY',
    date: '2023-12-25',
    readTime: '5 min read',
    featured: false
  }
];

export const findJournalPost = (id?: string) => journalPosts.find(post => String(post.id) === id);
