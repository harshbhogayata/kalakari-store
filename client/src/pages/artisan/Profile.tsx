import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, MapPin, Edit, Save, X, Award, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
// import { Artisan } from '../../types'; // TODO: Use for artisan type when needed
import api from '../../utils/api';
import toast from 'react-hot-toast';

interface ArtisanProfileFormData {
  businessName: string;
  description: string;
  craftType: string;
  state: string;
  city: string;
  experience: number;
  languages: string[];
}

const ArtisanProfile: React.FC = () => {
  const { artisan } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ArtisanProfileFormData>({
    defaultValues: {
      businessName: artisan?.businessName || '',
      description: artisan?.description || '',
      craftType: artisan?.craftType || '',
      state: artisan?.state || '',
      city: artisan?.city || '',
      experience: artisan?.experience || 0,
      languages: artisan?.languages || [],
    },
  });

  const onSubmit = async (data: ArtisanProfileFormData) => {
    setIsLoading(true);
    try {
      await api.put('/artisans/profile', data);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      // Refresh artisan data
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
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

  // const languages = [
  //   'Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 
  //   'Urdu', 'Kannada', 'Odia', 'Punjabi', 'Malayalam', 'Assamese', 'Other'
  // ];

  if (!artisan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Artisan Profile Not Found</h2>
          <p className="text-gray-600 mb-8">You need to create an artisan profile first.</p>
          <button className="btn-primary">Create Artisan Profile</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center">
              {artisan.profileImage ? (
                <img
                  src={artisan.profileImage}
                  alt={artisan.businessName}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-primary-600">
                  {artisan.businessName.charAt(0)}
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{artisan.businessName}</h1>
                {artisan.isVerified && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Award className="w-5 h-5" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{artisan.city}, {artisan.state}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <Award className="w-4 h-4" />
                  <span>{artisan.craftType}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <Star className="w-4 h-4" />
                  <span>{artisan.experience}+ years experience</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold">{artisan.rating.average.toFixed(1)}</span>
                  <span className="text-gray-600">({artisan.rating.count} reviews)</span>
                </div>
                <div className="text-gray-600">
                  ₹{artisan.totalSales.toLocaleString()} in sales
                </div>
              </div>
              
              <p className="text-gray-600 leading-relaxed">{artisan.description}</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-outline flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                {isEditing ? (
                  <input
                    {...register('businessName', {
                      required: 'Business name is required',
                      minLength: {
                        value: 2,
                        message: 'Business name must be at least 2 characters',
                      },
                    })}
                    type="text"
                    className="input-field"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{artisan.businessName}</span>
                  </div>
                )}
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Craft Type *
                </label>
                {isEditing ? (
                  <select
                    {...register('craftType', { required: 'Craft type is required' })}
                    className="input-field"
                  >
                    <option value="">Select craft type</option>
                    {craftTypes.map(craftType => (
                      <option key={craftType} value={craftType}>{craftType}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Award className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{artisan.craftType}</span>
                  </div>
                )}
                {errors.craftType && (
                  <p className="mt-1 text-sm text-red-600">{errors.craftType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                {isEditing ? (
                  <select
                    {...register('state', { required: 'State is required' })}
                    className="input-field"
                  >
                    <option value="">Select state</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{artisan.state}</span>
                  </div>
                )}
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                {isEditing ? (
                  <input
                    {...register('city', { required: 'City is required' })}
                    type="text"
                    className="input-field"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{artisan.city}</span>
                  </div>
                )}
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (Years) *
                </label>
                {isEditing ? (
                  <input
                    {...register('experience', {
                      required: 'Experience is required',
                      min: { value: 0, message: 'Experience cannot be negative' },
                    })}
                    type="number"
                    className="input-field"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Star className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{artisan.experience} years</span>
                  </div>
                )}
                {errors.experience && (
                  <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              {isEditing ? (
                <textarea
                  {...register('description', {
                    required: 'Description is required',
                    minLength: {
                      value: 10,
                      message: 'Description must be at least 10 characters',
                    },
                  })}
                  rows={4}
                  className="input-field"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{artisan.description}</p>
                </div>
              )}
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isLoading ? (
                    <div className="loading-spinner w-4 h-4"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArtisanProfile;
