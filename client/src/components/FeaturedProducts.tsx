import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

interface FeaturedProductsProps {
  products?: Product[];
  isLoading?: boolean;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products = [], isLoading = false }) => {
  const { t } = useTranslation();

  // Sample featured products if none provided
  const featuredProducts = products.length > 0 ? products.slice(0, 3) : [
    {
      _id: '1',
      name: 'Jaipuri Blue Pottery Vase',
      description: 'From the studios of Rajasthan',
      price: 1250,
      images: [{ url: 'https://images.unsplash.com/photo-1605910465373-455b23d9161a?q=80&w=1887&auto=format&fit=crop', alt: 'Jaipuri Blue Pottery Vase' }],
      category: 'Pottery',
      inventory: { total: 10, available: 10, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan1',
      variants: [],
      tags: ['Bestseller'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Kullu Handwoven Shawl',
      description: 'Woven with Himalayan warmth',
      price: 2800,
      images: [{ url: 'https://images.unsplash.com/photo-1619521441258-501a6b0f1b2a?q=80&w=1887&auto=format&fit=crop', alt: 'Kullu Handwoven Shawl' }],
      category: 'Textiles',
      inventory: { total: 0, available: 0, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan2',
      variants: [],
      tags: ['Sold Out'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '3',
      name: 'Channapatna Wooden Toys',
      description: 'A legacy of playful art',
      price: 800,
      images: [{ url: 'https://images.unsplash.com/photo-1695526829431-70098f413e16?q=80&w=1887&auto=format&fit=crop', alt: 'Channapatna Wooden Toys' }],
      category: 'Toys',
      inventory: { total: 15, available: 15, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan3',
      variants: [],
      tags: ['Eco-Friendly'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Custom handler for add to cart
  const handleAddToCart = (product: Product) => {
    // This will be handled by the ProductCard component
  };

  return (
    <section id="featured" className="py-28">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-5xl font-serif mb-4 animate-reveal">{t('home.featuredProducts')}</h2>
          <p className="text-lg text-gray-600 animate-reveal" style={{ animationDelay: '150ms' }}>
            {t('home.featuredProductsDescription')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading skeletons using ProductCardSkeleton
            Array.from({ length: 3 }).map((_, index) => (
              <ProductCardSkeleton key={index} variant="featured" />
            ))
          ) : (
            featuredProducts.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                variant="featured"
                showRating={false}
                showStats={false}
                showWishlist={true}
                showQuickView={true}
                onAddToCart={handleAddToCart}
                className="animate-reveal"
              />
            ))
          )}
        </div>
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-block px-10 py-3 rounded-md font-medium text-center transition-all duration-300 ease-in-out bg-brand-clay text-white shadow-lg hover:bg-brand-clay-dark hover:shadow-xl hover:-translate-y-0.5"
          >
            {t('common.viewAllProducts')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
