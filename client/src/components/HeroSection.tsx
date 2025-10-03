import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBackgroundLoaded(true);
    img.src = 'https://media.istockphoto.com/id/1453245838/photo/skilled-craftsman-working-manually-a-detailed-bamboo-wood-armchair-with-his-fingers-and-tools.jpg?s=1024x1024&w=is&k=20&c=vM08wPXTdTpCJ1S0YmAQsAJo-k3Lwy5U-JU6NXxItBk=';
  }, []);

  return (
    <section 
      className={`text-brand-base min-h-[85vh] flex flex-col justify-center relative z-0 ${
        backgroundLoaded ? 'transition-all duration-1000' : 'bg-brand-stone'
      }`}
      style={{
        backgroundImage: backgroundLoaded 
          ? `linear-gradient(to top, rgba(58, 46, 36, 0.6), rgba(58, 46, 36, 0.2)), url('https://media.istockphoto.com/id/1453245838/photo/skilled-craftsman-working-manually-a-detailed-bamboo-wood-armchair-with-his-fingers-and-tools.jpg?s=1024x1024&w=is&k=20&c=vM08wPXTdTpCJ1S0YmAQsAJo-k3Lwy5U-JU6NXxItBk=')`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif italic mb-6 animate-reveal">
          {t('home.hero.title')}
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 animate-reveal" style={{ animationDelay: '200ms' }}>
          {t('home.hero.subtitle')}
        </p>
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 animate-reveal" style={{ animationDelay: '400ms' }}>
          <Link
            to="/products"
            className="inline-block px-10 py-3 rounded-md font-medium text-center transition-all duration-300 ease-in-out bg-brand-clay text-white shadow-lg hover:bg-brand-clay-dark hover:shadow-xl hover:-translate-y-0.5"
          >
            {t('home.hero.cta')}
          </Link>
          <Link
            to="/artisans"
            className="inline-block px-10 py-3 rounded-md font-medium text-center transition-all duration-300 ease-in-out bg-transparent text-white border-2 border-white hover:bg-white hover:text-brand-ink"
          >
            {t('navigation.artisans')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
