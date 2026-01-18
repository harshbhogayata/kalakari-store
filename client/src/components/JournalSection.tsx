import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const JournalSection: React.FC = () => {
  const { t } = useTranslation();

  const journalPosts = [
    {
      title: 'The Ancient Art of Block Printing',
      category: 'TEXTILES',
      description: 'Explore the history and intricate process behind one of India\'s most beloved textile traditions.',
      image: '/images/journal/block_printing.png',
      delay: '0ms'
    },
    {
      title: 'A Day with the Meenakari Masters',
      category: 'BEHIND THE CRAFT',
      description: 'We sit down with a family that has been practicing the art of enamel jewelry for five generations.',
      image: '/images/journal/meenakari.png',
      delay: '200ms'
    },
    {
      title: 'Pichwai: The Divine Paintings of Nathdwara',
      category: 'ART FORM',
      description: 'Discover the spiritual significance and detailed artistry of these stunning cloth paintings.',
      image: '/images/journal/pichwai.png',
      delay: '400ms'
    }
  ];

  return (
    <section id="journal" className="py-16">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-5xl font-serif mb-4 animate-reveal">{t('home.journal.title')}</h2>
          <p className="text-lg text-gray-600 animate-reveal" style={{ animationDelay: '150ms' }}>
            {t('home.journal.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {journalPosts.map((post, index) => (
            <Link
              key={index}
              to="/journal"
              className="group block animate-reveal focus-within:ring-2 focus-within:ring-brand-gold focus-within:ring-offset-4 focus-within:ring-offset-brand-base rounded-lg"
              style={{ animationDelay: post.delay }}
            >
              <div className="overflow-hidden rounded-lg shadow-lg">
                <img
                  loading="lazy"
                  width="600"
                  height="400"
                  src={post.image}
                  alt={post.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/600x400/EAE5DE/3A2E24?text=Journal';
                  }}
                />
              </div>
              <div className="mt-6">
                <p className="text-sm text-brand-clay font-semibold mb-2">{post.category}</p>
                <h3 className="text-2xl font-serif group-hover:text-brand-clay transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 mt-2">{post.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            to="/journal"
            className="inline-block px-10 py-3 rounded-md font-medium text-center transition-all duration-300 ease-in-out bg-brand-clay text-white shadow-lg hover:bg-brand-clay-dark hover:shadow-xl hover:-translate-y-0.5"
          >
            {t('home.journal.readMore')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default JournalSection;
