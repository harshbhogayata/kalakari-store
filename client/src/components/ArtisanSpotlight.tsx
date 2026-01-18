import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ArtisanSpotlight: React.FC = () => {
  const { t } = useTranslation();

  const featuredArtisan = {
    name: 'Rina Devi',
    title: 'FEATURED ARTISAN: WEAVER',
    quote: '"The loom is a part of my family. Every thread tells the story of my ancestors, and I weave that story into every shawl."',
    description: 'From a small village in the Kullu Valley, Rina Devi has been weaving for over 25 years, a skill passed down to her from her mother and grandmother. She uses only hand-spun local wool and natural dyes made from flowers and minerals found in the Himalayan foothills. Her work is renowned for its intricate geometric patterns and exceptional softness.',
    image: '/images/artisans/rina_devi.png',
    products: [
      {
        name: 'Kullu Handwoven Shawl',
        price: 2800,
        image: '/images/products/shawl.png'
      },
      {
        name: 'Himalayan Woolen Scarf',
        price: 1950,
        image: '/images/products/scarf.png'
      }
    ]
  };

  return (
    <section id="artisan-spotlight" className="py-16">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-5xl font-serif mb-4 animate-reveal">{t('home.artisanSpotlight.title')}</h2>
          <p className="text-lg text-gray-600 animate-reveal" style={{ animationDelay: '150ms' }}>
            {t('home.artisanSpotlight.subtitle')}
          </p>
        </div>
        <div className="bg-brand-stone/50 rounded-lg p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-12 focus-within:ring-2 focus-within:ring-brand-gold focus-within:ring-offset-4 focus-within:ring-offset-brand-base rounded-lg">
          <div className="lg:w-1/3 animate-reveal">
            <img
              loading="lazy"
              width="600"
              height="700"
              src={featuredArtisan.image}
              className="rounded-lg shadow-2xl w-full h-auto"
              alt={`Portrait of ${featuredArtisan.name}`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder-artisan.png';
              }}
            />
          </div>
          <div className="lg:w-2/3 animate-reveal" style={{ animationDelay: '200ms' }}>
            <p className="text-sm text-brand-clay font-semibold mb-2">{featuredArtisan.title}</p>
            <h3 className="text-4xl font-serif mb-4">{featuredArtisan.name}</h3>
            <p className="text-2xl text-gray-700 italic font-serif leading-relaxed mb-6">
              {featuredArtisan.quote}
            </p>
            <p className="text-gray-600 mb-8">{featuredArtisan.description}</p>
            <div>
              <h4 className="font-bold text-lg text-brand-ink mb-4">{t('home.artisanSpotlight.shopCollection', { name: featuredArtisan.name.split(' ')[0] })}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {featuredArtisan.products.map((product, index) => (
                  <Link
                    key={index}
                    to="/products"
                    className="group flex items-center bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow focus-within:ring-2 focus-within:ring-brand-gold focus-within:ring-offset-4 focus-within:ring-offset-brand-base rounded-lg"
                  >
                    <img
                      loading="lazy"
                      width="100"
                      height="100"
                      src={product.image}
                      className="w-20 h-20 rounded-md object-cover mr-4"
                      alt={product.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/100x100/EAE5DE/3A2E24?text=Product';
                      }}
                    />
                    <div>
                      <h5 className="font-serif text-lg group-hover:text-brand-clay">{product.name}</h5>
                      <p className="font-bold text-brand-clay">₹{product.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtisanSpotlight;
