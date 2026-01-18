import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Journal: React.FC = () => {
  const { t } = useTranslation();
  const placeholderImage = '/images/placeholder-journal.png';

  const journalPosts = [
    {
      id: 1,
      title: 'The Ancient Art of Block Printing',
      excerpt: 'Explore the history and intricate process behind one of India\'s most beloved textile traditions.',
      image: 'https://images.unsplash.com/photo-1600661633315-7389108b31a1?q=80&w=1887&auto=format&fit=crop',
      category: 'TEXTILES',
      date: '2024-01-15',
      readTime: '5 min read',
      featured: true
    },
    {
      id: 2,
      title: 'A Day with the Meenakari Masters',
      excerpt: 'We sit down with a family that has been practicing the art of enamel jewelry for five generations.',
      image: 'https://images.unsplash.com/photo-1599408226244-5d0718ac8e99?q=80&w=1887&auto=format&fit=crop',
      category: 'BEHIND THE CRAFT',
      date: '2024-01-10',
      readTime: '7 min read',
      featured: false
    },
    {
      id: 3,
      title: 'Pichwai: The Divine Paintings of Nathdwara',
      excerpt: 'Discover the spiritual significance and detailed artistry of these stunning cloth paintings.',
      image: 'https://images.unsplash.com/photo-1621213327315-b74549071b78?q=80&w=1964&auto=format&fit=crop',
      category: 'ART FORM',
      date: '2024-01-05',
      readTime: '6 min read',
      featured: false
    },
    {
      id: 4,
      title: 'The Craft of Kalamkari: Storytelling Through Cloth',
      excerpt: 'Understanding the traditional pen work and natural dyeing techniques of this ancient art form.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1887&auto=format&fit=crop',
      category: 'TEXTILES',
      date: '2024-01-01',
      readTime: '8 min read',
      featured: false
    },
    {
      id: 5,
      title: 'Wood Carving Traditions of Rajasthan',
      excerpt: 'A journey through the intricate woodwork that adorns palaces and temples across Rajasthan.',
      image: 'https://images.unsplash.com/photo-1605910465373-455b23d9161a?q=80&w=1887&auto=format&fit=crop',
      category: 'WOODWORK',
      date: '2023-12-28',
      readTime: '6 min read',
      featured: false
    },
    {
      id: 6,
      title: 'The Art of Terracotta: From Clay to Masterpiece',
      excerpt: 'Exploring the traditional techniques and modern innovations in terracotta craftsmanship.',
      image: 'https://images.unsplash.com/photo-1578312401928-02431a4c442a?q=80&w=1974&auto=format&fit=crop',
      category: 'POTTERY',
      date: '2023-12-25',
      readTime: '5 min read',
      featured: false
    }
  ];

  const categories = [
    'All', 'TEXTILES', 'BEHIND THE CRAFT', 'ART FORM', 'WOODWORK', 'POTTERY'
  ];

  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredPosts = selectedCategory === 'All'
    ? journalPosts
    : journalPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-brand-base">
      {/* Hero Section */}
      <section className="bg-brand-stone/50 py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-serif mb-4 text-brand-ink">
            {t('journal.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('journal.subtitle')}
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {journalPosts.filter(post => post.featured).map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden mb-16">
              <div className="lg:flex">
                <div className="lg:w-2/3">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-64 lg:h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = placeholderImage;
                    }}
                  />
                </div>
                <div className="lg:w-1/3 p-8 flex flex-col justify-center">
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="w-4 h-4 text-brand-clay" />
                    <span className="text-sm text-brand-clay font-semibold">{post.category}</span>
                  </div>
                  <h2 className="text-3xl font-serif mb-4 text-brand-ink">{post.title}</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                  <Link
                    to={`/journal/${post.id}`}
                    className="inline-flex items-center text-brand-clay hover:text-brand-clay-dark font-medium transition-colors"
                  >
                    {t('journal.readMore')}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                    ? 'bg-brand-clay text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Journal Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.filter(post => !post.featured).map((post) => (
              <Link
                key={post.id}
                to={`/journal/${post.id}`}
                className="group block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover block group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = placeholderImage;
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Tag className="w-4 h-4 text-brand-clay" />
                    <span className="text-sm text-brand-clay font-semibold">{post.category}</span>
                  </div>
                  <h3 className="text-xl font-serif mb-3 text-brand-ink group-hover:text-brand-clay transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-brand-stone/50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-serif mb-4 text-brand-ink">
            {t('journal.newsletter.title')}
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('journal.newsletter.subtitle')}
          </p>
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder={t('journal.newsletter.placeholder')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
            />
            <button
              type="submit"
              className="bg-brand-clay text-white px-6 py-3 rounded-lg hover:bg-brand-clay-dark transition-colors"
            >
              {t('journal.newsletter.button')}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Journal;
