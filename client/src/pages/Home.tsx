import React, { useState } from 'react';
import { useQuery } from 'react-query';
import api from '../utils/api';
import AnnouncementBar from '../components/AnnouncementBar';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import FeaturedProducts from '../components/FeaturedProducts';
import ArtisanStory from '../components/ArtisanStory';
import ArtisanSpotlight from '../components/ArtisanSpotlight';
import JournalSection from '../components/JournalSection';
import TestimonialsSection from '../components/TestimonialsSection';
import NotifyMeModal from '../components/NotifyMeModal';
import TrendingProducts from '../components/Recommendations/TrendingProducts';

const Home: React.FC = () => {
  // const { t } = useTranslation();
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  // Fetch featured products with better error handling and caching
  const { data: featuredProducts, isLoading } = useQuery(
    'featured-products', 
    async () => {
      try {
        // Use mock endpoint in development mode
        const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/products' : '/products';
        const response = await api.get(`${endpoint}?featured=true&limit=3`);
        return response.data.data?.products || [];
      } catch (error) {
        // Featured products loading error handled silently - will use empty array
        return [];
      }
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNotifyMe = (productName: string) => {
    setSelectedProduct(productName);
    setNotifyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-brand-base">
      <AnnouncementBar />
      <HeroSection />
      <FeaturesSection />
      <FeaturedProducts products={featuredProducts} isLoading={isLoading} />
      <TrendingProducts limit={8} />
      <ArtisanStory />
      <ArtisanSpotlight />
      <JournalSection />
      <TestimonialsSection />
      
      <NotifyMeModal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        productName={selectedProduct}
      />
    </div>
  );
};

export default Home;
