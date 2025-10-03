import React from 'react';
import { Shield, Heart, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: Shield,
      title: t('home.features.authentic.title'),
      description: t('home.features.authentic.description'),
      delay: '0ms'
    },
    {
      icon: Heart,
      title: t('home.features.support.title'),
      description: t('home.features.support.description'),
      delay: '150ms'
    },
    {
      icon: Truck,
      title: t('home.features.quality.title'),
      description: t('home.features.quality.description'),
      delay: '300ms'
    }
  ];

  return (
    <section className="py-24 bg-brand-stone/50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {features.map((feature, index) => (
            <div key={index} className="animate-reveal" style={{ animationDelay: feature.delay }}>
              <div className="mx-auto bg-brand-gold/20 rounded-full h-20 w-20 flex items-center justify-center mb-6">
                <feature.icon className="h-10 w-10 text-brand-clay" />
              </div>
              <h3 className="text-2xl font-serif mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
