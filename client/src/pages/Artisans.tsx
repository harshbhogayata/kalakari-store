import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Star, MapPin, Award, Users } from 'lucide-react';
import api from '../utils/api';
import { Artisan } from '../types';

const Artisans: React.FC = () => {
  const [filters, setFilters] = useState({
    craftType: '',
    state: '',
  });

  const { data: artisansData, isLoading } = useQuery(
    ['artisans', filters],
    async () => {
      const params = new URLSearchParams();
      if (filters.craftType) params.append('craftType', filters.craftType);
      if (filters.state) params.append('state', filters.state);
      
      const endpoint = '/api/artisans';
      const response = await api.get(`${endpoint}?${params.toString()}`);
      return response.data.data;
    }
  );

  const craftTypes = [
    'Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork',
    'Leather', 'Bamboo', 'Stone', 'Glass', 'Paper', 'Other'
  ];

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Artisans</h1>
          <p className="text-gray-600">
            Discover the talented craftspeople behind our authentic handcrafted products
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Craft Type
              </label>
              <select
                value={filters.craftType}
                onChange={(e) => setFilters({ ...filters, craftType: e.target.value })}
                className="input-field"
              >
                <option value="">All Craft Types</option>
                {craftTypes.map(craftType => (
                  <option key={craftType} value={craftType}>{craftType}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                className="input-field"
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Artisans Grid */}
        {artisansData?.artisans?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisansData.artisans.map((artisan: Artisan) => (
              <Link
                key={artisan._id}
                to={`/artisans/${artisan._id}`}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    {artisan.profileImage ? (
                      <img
                        src={artisan.profileImage}
                        alt={artisan.businessName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary-600">
                        {artisan.businessName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {artisan.businessName}
                    </h3>
                    <p className="text-sm text-gray-600">{artisan.craftType}</p>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{artisan.city}, {artisan.state}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {artisan.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {artisan.rating.average.toFixed(1)} ({artisan.rating.count})
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Award className="w-4 h-4" />
                    <span>{artisan.experience}+ years</span>
                  </div>
                </div>
                
                {artisan.isVerified && (
                  <div className="mt-3 flex items-center space-x-1 text-green-600 text-sm">
                    <Users className="w-4 h-4" />
                    <span>Verified Artisan</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No artisans found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your filter criteria
            </p>
          </div>
        )}

        {/* Pagination */}
        {artisansData?.pagination && artisansData.pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: artisansData.pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`px-3 py-2 rounded ${
                    page === artisansData.pagination.current
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Artisans;
