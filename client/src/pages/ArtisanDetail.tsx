import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Star, MapPin, Award, Users, Heart, ShoppingCart } from 'lucide-react';
import api from '../utils/api';
import { Artisan } from '../types';
import LazyImage from '../components/LazyImage';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const ArtisanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'story' | 'products' | 'achievements'>('story');

  const { data: artisanData, isLoading, error } = useQuery(
    ['artisan', id],
    async () => {
      const endpoint = '/api/artisans';
      const response = await api.get(`${endpoint}/${id}`);
      return response.data.data.artisan;
    },
    {
      enabled: !!id
    }
  );

  const artisan: Artisan = artisanData;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !artisan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage 
          message="Artisan not found" 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/artisans')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Artisans</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Artisan Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Profile Image */}
                <div className="flex-shrink-0">
                  {artisan.profileImage ? (
                    <LazyImage
                      src={artisan.profileImage}
                      alt={artisan.businessName}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary-600">
                        {artisan.businessName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

            {/* Artisan Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {artisan.businessName}
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">{artisan.craftType}</p>
                  
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{artisan.city}, {artisan.state}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Award className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{artisan.experience}+ years experience</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(artisan.rating.average)}
                      <span className="text-sm text-gray-600 ml-2">
                        {artisan.rating.average.toFixed(1)} ({artisan.rating.count} reviews)
                      </span>
                    </div>
                    
                    {artisan.isVerified && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">Verified Artisan</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button className="btn-outline flex items-center space-x-2">
                    <Heart className="w-4 h-4" />
                    <span>Follow</span>
                  </button>
                  <Link
                    to={`/products?artisanId=${artisan._id}`}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Shop Collection</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'story', label: 'Story' },
                { id: 'products', label: 'Products' },
                { id: 'achievements', label: 'Achievements' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'story' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Story</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {artisan.story || artisan.description}
                </p>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Featured Products</h3>
                {artisan.products && artisan.products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artisan.products.map((product: any) => (
                      <Link
                        key={product._id}
                        to={`/products/${product._id}`}
                        className="group bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        <LazyImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-primary-600 font-semibold mt-2">
                            ₹{product.price.toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No products available yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'achievements' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Achievements & Recognition</h3>
                {artisan.achievements && artisan.achievements.length > 0 ? (
                  <div className="space-y-4">
                    {artisan.achievements.map((achievement: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <Award className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{achievement}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No achievements listed yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanDetail;
