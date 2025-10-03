import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Users, CheckCircle, XCircle, MapPin, Award, Star } from 'lucide-react';
import api from '../../utils/api';
import { Artisan } from '../../types';
import toast from 'react-hot-toast';

const AdminArtisans: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [craftTypeFilter, setCraftTypeFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  const { data: artisansData, isLoading, refetch } = useQuery(
    ['admin-artisans', statusFilter, craftTypeFilter, stateFilter],
    async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (craftTypeFilter) params.append('craftType', craftTypeFilter);
      if (stateFilter) params.append('state', stateFilter);
      
      const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/admin/artisans' : '/admin/artisans';
      const response = await api.get(`${endpoint}?${params.toString()}`);
      return response.data.data;
    }
  );

  const handleApproveArtisan = async (artisanId: string, isApproved: boolean) => {
    try {
      await api.put(`/admin/artisans/${artisanId}/approve`, {
        isApproved,
        notes: isApproved ? 'Approved by admin' : 'Rejected by admin'
      });
      toast.success(`Artisan ${isApproved ? 'approved' : 'rejected'} successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update artisan status');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Manage Artisans</h1>
          <p className="text-gray-600 mt-2">
            Review and approve artisan applications
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Craft Type
              </label>
              <select
                value={craftTypeFilter}
                onChange={(e) => setCraftTypeFilter(e.target.value)}
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
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
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

        {/* Artisans List */}
        {artisansData?.artisans?.length > 0 ? (
          <div className="space-y-6">
            {artisansData.artisans.map((artisan: Artisan) => (
              <div key={artisan._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
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
                      <h3 className="font-semibold text-gray-900">{artisan.businessName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Award className="w-4 h-4" />
                          <span>{artisan.craftType}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{artisan.city}, {artisan.state}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4" />
                          <span>{artisan.experience}+ years</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      artisan.isApproved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {artisan.isApproved ? 'Approved' : 'Pending'}
                    </span>
                    {!artisan.isApproved && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveArtisan(artisan._id, true)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleApproveArtisan(artisan._id, false)}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{artisan.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Email: {typeof artisan.userId === 'object' ? (artisan.userId as any).email : 'N/A'}</p>
                      <p>Phone: {typeof artisan.userId === 'object' ? (artisan.userId as any).phone : 'N/A'}</p>
                      <p>Languages: {artisan.languages?.join(', ') || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Total Sales: ₹{artisan.totalSales.toLocaleString()}</span>
                      <span>Rating: {artisan.rating.average.toFixed(1)} ({artisan.rating.count} reviews)</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Joined: {new Date(artisan.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No artisans found</h2>
            <p className="text-gray-600">
              {statusFilter || craftTypeFilter || stateFilter
                ? 'No artisans match your filter criteria.'
                : 'No artisans have registered yet.'
              }
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

export default AdminArtisans;
