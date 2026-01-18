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
  const featuredProducts = products.length > 0 ? products.slice(0, 8) : [
    {
      _id: '1',
      name: 'Jaipuri Blue Pottery Vase',
      description: 'Handcrafted with traditional Rajasthani techniques passed down through generations.',
      price: 1250,
      images: [{ url: '/images/products/pottery_blue_bowl.png', alt: 'Jaipuri Blue Pottery Vase' }],
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
      description: 'Woven with pure Himalayan wool, keeping you warm with authentic mountain craftsmanship.',
      price: 2800,
      images: [{ url: '/images/products/shawl.png', alt: 'Kullu Handwoven Shawl' }], // Keeping shawl as it exists and looks okay, or confirm replacement
      category: 'Textiles',
      inventory: { total: 5, available: 5, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan2',
      variants: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '3',
      name: 'Channapatna Wooden Toys',
      description: 'Eco-friendly lacquer-painted toys made using traditional techniques from Karnataka.',
      price: 800,
      images: [{ url: '/images/products/wood_carved_table.png', alt: 'Channapatna Wooden Toys' }], // Using carved table as proxy for high-quality wood item
      category: 'Woodwork',
      inventory: { total: 15, available: 15, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan3',
      variants: [],
      tags: ['Eco-Friendly'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '4',
      name: 'Bidri Silver Inlay Box',
      description: 'Exquisite metalwork from Bidar, featuring intricate silver inlay on blackened alloy.',
      price: 3500,
      images: [{ url: '/images/products/jewelry_silver_necklace.png', alt: 'Bidri Silver Inlay Box' }],
      category: 'Metalwork',
      inventory: { total: 3, available: 3, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan4',
      variants: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '5',
      name: 'Madhubani Folk Painting',
      description: 'Traditional Mithila art painting with intricate details and natural dyes.',
      price: 4200,
      images: [{ url: '/images/products/painting_traditional.png', alt: 'Madhubani Folk Painting' }],
      category: 'Paintings',
      inventory: { total: 1, available: 1, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan5',
      variants: [],
      tags: ['One of a kind'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '6',
      name: 'Antique Brass Vase',
      description: 'Hand-engraved brass vase with traditional floral motifs and polished finish.',
      price: 2100,
      images: [{ url: '/images/products/metal_brass_vase.png', alt: 'Antique Brass Vase' }],
      category: 'Metalwork',
      inventory: { total: 5, available: 5, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan6',
      variants: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '7',
      name: 'Embossed Leather Satchel',
      description: 'Genuine leather bag with Shantiniketan style embossing and brass buckles.',
      price: 3800,
      images: [{ url: '/images/products/leather_bag.png', alt: 'Embossed Leather Satchel' }],
      category: 'Leather',
      inventory: { total: 7, available: 7, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan7',
      variants: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '8',
      name: 'Boho Macrame Wall Hanging',
      description: 'Intricate knotted wall decor using natural cotton ropes and wooden beads.',
      price: 1500,
      images: [{ url: '/images/products/decor_wall_hanging.png', alt: 'Boho Macrame Wall Hanging' }],
      category: 'Home Decor',
      inventory: { total: 12, available: 12, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan8',
      variants: [],
      tags: ['Trending'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-brand-base to-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-clay font-medium tracking-widest text-sm uppercase mb-4 block animate-reveal">
            Curated Selection
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 animate-reveal" style={{ animationDelay: '100ms' }}>
            {t('home.featuredProducts')}
          </h2>
          <p className="text-lg text-gray-600 animate-reveal" style={{ animationDelay: '200ms' }}>
            {t('home.featuredProductsDescription')}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          ) : (
            featuredProducts.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                variant="compact"
                showRating={true}
                showStats={false}
                showWishlist={true}
                showQuickView={true}
                className="animate-reveal"
              />
            ))
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-14">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-ink text-white font-medium rounded-full hover:bg-brand-clay transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            {t('common.viewAllProducts')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
