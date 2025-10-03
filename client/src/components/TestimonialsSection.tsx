import React from 'react';
import { useTranslation } from 'react-i18next';

const TestimonialsSection: React.FC = () => {
  const { t } = useTranslation();
  
  const testimonials = [
    {
      name: 'Priya S.',
      location: 'Bangalore',
      text: '"The vase I ordered is even more beautiful in person. You can feel the history and the artisan\'s touch. It\'s the centerpiece of my home now."',
      avatar: 'https://i.pravatar.cc/100?u=a',
      delay: '0ms'
    },
    {
      name: 'Rohan M.',
      location: 'Mumbai',
      text: '"I bought a shawl as a gift for my mother, and she was moved to tears. The quality is exceptional, and I love that my purchase supports local artisans."',
      avatar: 'https://i.pravatar.cc/100?u=b',
      delay: '200ms'
    },
    {
      name: 'Anjali D.',
      location: 'New Delhi',
      text: '"Finally, a place to find authentic, high-quality Indian crafts without the guesswork. Kalakari is a treasure trove. Highly recommended!"',
      avatar: 'https://i.pravatar.cc/100?u=c',
      delay: '400ms'
    }
  ];

  return (
    <section className="py-28 bg-brand-stone bg-hero-pattern">
      <div className="container mx-auto px-6">
        <h2 className="text-5xl font-serif text-center mb-20 animate-reveal">{t('home.testimonials.title')}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-brand-base p-8 rounded-lg shadow-lg text-center animate-reveal focus-within:ring-2 focus-within:ring-brand-gold focus-within:ring-offset-4 focus-within:ring-offset-brand-base rounded-lg"
              style={{ animationDelay: testimonial.delay }}
            >
              <img
                loading="lazy"
                width="100"
                height="100"
                src={testimonial.avatar}
                alt={`${testimonial.name} avatar`}
                className="h-20 w-20 rounded-full mx-auto -mt-16 mb-6 border-4 border-brand-base"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/100x100/EAE5DE/3A2E24?text=Avatar';
                }}
              />
              <p className="text-lg text-gray-700 italic mb-6">{testimonial.text}</p>
              <p className="font-semibold text-brand-ink">- {testimonial.name}, {testimonial.location}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
