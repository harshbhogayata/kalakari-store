import React, { useState } from 'react';
import { Star, Sparkles, Gift, Home } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

const DiwaliCollection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock Diwali products
  const diwaliProducts: Product[] = [
    // Diyas & Lamps
    {
      _id: 'diwali_1',
      name: 'Handcrafted Brass Diya Set',
      description: 'Traditional brass diyas with intricate engravings - perfect for Diwali celebrations',
      price: 899,
      images: [{ url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e3c?q=80&w=800', alt: 'Brass Diya Set' }],
      category: 'Diyas & Lamps',
      inventory: { total: 25, available: 25, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan_1',
      variants: [],
      tags: ['Diwali', 'Traditional', 'Brass', 'Handcrafted'],
      rating: { average: 4.8, count: 124 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'diwali_2',
      name: 'Terracotta Oil Lamps',
      description: 'Eco-friendly terracotta oil lamps with traditional Indian designs',
      price: 299,
      images: [{ url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e3d?q=80&w=800', alt: 'Terracotta Oil Lamps' }],
      category: 'Diyas & Lamps',
      inventory: { total: 50, available: 50, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan_2',
      variants: [],
      tags: ['Diwali', 'Eco-Friendly', 'Terracotta', 'Traditional'],
      rating: { average: 4.6, count: 89 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Rangoli Materials
    {
      _id: 'diwali_3',
      name: 'Colorful Rangoli Powder Set',
      description: 'Vibrant rangoli colors for creating beautiful Diwali decorations',
      price: 199,
      images: [{ url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e3e?q=80&w=800', alt: 'Rangoli Powder Set' }],
      category: 'Rangoli & Decor',
      inventory: { total: 30, available: 30, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan_3',
      variants: [],
      tags: ['Diwali', 'Rangoli', 'Colors', 'Festive'],
      rating: { average: 4.5, count: 67 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'diwali_4',
      name: 'Decorative Rangoli Stencils',
      description: 'Reusable stencils for creating intricate rangoli patterns',
      price: 149,
      images: [{ url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e3f?q=80&w=800', alt: 'Rangoli Stencils' }],
      category: 'Rangoli & Decor',
      inventory: { total: 40, available: 40, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan_1',
      variants: [],
      tags: ['Diwali', 'Stencils', 'Rangoli', 'Decorative'],
      rating: { average: 4.4, count: 45 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Torans & Door Hangings
    {
      _id: 'diwali_5',
      name: 'Golden Toran for Door',
      description: 'Elegant golden toran with traditional motifs for Diwali decoration',
      price: 1299,
      images: [{ url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e40?q=80&w=800', alt: 'Golden Toran' }],
      category: 'Torans & Hangings',
      inventory: { total: 15, available: 15, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan_2',
      variants: [],
      tags: ['Diwali', 'Toran', 'Golden', 'Door Decoration'],
      rating: { average: 4.7, count: 78 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'diwali_6',
      name: 'Marigold Flower Toran',
      description: 'Beautiful marigold flower toran bringing festive cheer to your home',
      price: 599,
      images: [{ url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e41?q=80&w=800', alt: 'Marigold Toran' }],
      category: 'Torans & Hangings',
      inventory: { total: 20, available: 20, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan_3',
      variants: [],
      tags: ['Diwali', 'Marigold', 'Flowers', 'Festive'],
      rating: { average: 4.6, count: 56 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Decorative Items
    {
      _id: 'diwali_7',
      name: 'Handmade Paper Lanterns',
      description: 'Colorful handmade paper lanterns for festive home decoration',
      price: 399,
      images: [{ url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e42?q=80&w=800', alt: 'Paper Lanterns' }],
      category: 'Decorative Items',
      inventory: { total: 35, available: 35, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan_1',
      variants: [],
      tags: ['Diwali', 'Lanterns', 'Paper', 'Handmade'],
      rating: { average: 4.5, count: 92 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'diwali_8',
      name: 'Festive Candle Holders',
      description: 'Elegant brass candle holders with traditional Indian designs',
      price: 799,
      images: [{ url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e43?q=80&w=800', alt: 'Candle Holders' }],
      category: 'Decorative Items',
      inventory: { total: 18, available: 18, reserved: 0 },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      artisanId: 'artisan_2',
      variants: [],
      tags: ['Diwali', 'Candles', 'Brass', 'Traditional'],
      rating: { average: 4.8, count: 67 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const categories = [
    { id: 'all', name: 'All Items', icon: Sparkles },
    { id: 'Diyas & Lamps', name: 'Diyas & Lamps', icon: Gift },
    { id: 'Rangoli & Decor', name: 'Rangoli & Decor', icon: Home },
    { id: 'Torans & Hangings', name: 'Torans & Hangings', icon: Star },
    { id: 'Decorative Items', name: 'Decorative Items', icon: Sparkles }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? diwaliProducts 
    : diwaliProducts.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-12 h-12 text-yellow-300" />
          </div>
          <h1 className="text-5xl font-serif font-bold mb-4">
            Diwali Collection
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Illuminate your celebrations with our handpicked collection of traditional Diwali items. 
            From elegant diyas to beautiful torans, bring the festival of lights to your home.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Shop by Category
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedCategory === 'all' ? 'All Diwali Items' : selectedCategory}
            </h2>
            <span className="text-gray-600">
              {filteredProducts.length} items
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No items found
              </h3>
              <p className="text-gray-600">
                Try selecting a different category or check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  variant="trending"
                  showRating={true}
                  showStats={false}
                  showWishlist={true}
                  showQuickView={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Festive Message */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">✨ Happy Diwali! ✨</h3>
          <p className="text-lg opacity-90">
            May this festival of lights bring joy, prosperity, and happiness to your home. 
            Thank you for choosing authentic Indian handicrafts for your celebrations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiwaliCollection;
