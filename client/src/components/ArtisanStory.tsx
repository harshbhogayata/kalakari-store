import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ArtisanStory: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section id="artisan-story" className="py-28 bg-brand-stone bg-hero-pattern">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 animate-reveal">
            <img
              loading="lazy"
              width="800"
              height="600"
              src="https://images.unsplash.com/photo-1578312401928-02431a4c442a?q=80&w=1974&auto=format&fit=crop"
              alt="Artisan hands shaping clay on a pottery wheel"
              className="rounded-lg shadow-2xl w-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/800x600/EAE5DE/3A2E24?text=Artisan';
              }}
            />
          </div>
          <div className="lg:w-1/2 text-center lg:text-left animate-reveal" style={{ animationDelay: '200ms' }}>
            <h2 className="text-5xl font-serif mb-6">{t('home.artisanStory.title')}</h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              {t('home.artisanStory.description')}
            </p>
            <Link
              to="/artisan-register"
              className="inline-block px-10 py-3 rounded-md font-medium text-center transition-all duration-300 ease-in-out bg-brand-clay text-white shadow-lg hover:bg-brand-clay-dark hover:shadow-xl hover:-translate-y-0.5"
            >
{t('home.artisanStory.cta')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtisanStory;
