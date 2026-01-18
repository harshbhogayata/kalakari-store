import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { Address } from '../../types';
import AddressCard from '../../components/AddressCard';
import AddressForm, { AddressFormData } from '../../components/AddressForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import toast from 'react-hot-toast';

const Addresses: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Fetch addresses
  const { data: addressesData, isLoading, error, refetch } = useQuery(
    ['addresses'],
    async () => {
      const endpoint = '/api/addresses';
      const response = await api.get(endpoint);
      return response.data.data.addresses || [];
    },
    {
      enabled: !!user
    }
  );

  const addresses: Address[] = addressesData || [];
  const defaultAddress = addresses.find(addr => addr.isDefault);

  // Create/Update address mutation
  const saveAddressMutation = useMutation(
    async (data: AddressFormData) => {
      const endpoint = '/api/addresses';
      
      if (editingAddress) {
        const response = await api.put(`${endpoint}/${editingAddress._id}`, data);
        return response.data;
      } else {
        const response = await api.post(endpoint, data);
        return response.data;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['addresses']);
        setShowForm(false);
        setEditingAddress(null);
        toast.success(editingAddress ? 'Address updated successfully' : 'Address added successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to save address');
      }
    }
  );

  // Delete address mutation
  const deleteAddressMutation = useMutation(
    async (addressId: string) => {
      const endpoint = '/api/addresses';
      const response = await api.delete(`${endpoint}/${addressId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['addresses']);
        toast.success('Address deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete address');
      }
    }
  );

  // Set default address mutation
  const setDefaultMutation = useMutation(
    async (addressId: string) => {
      const endpoint = '/api/addresses';
      const response = await api.patch(`${endpoint}/${addressId}/default`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['addresses']);
        toast.success('Default address updated');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to set default address');
      }
    }
  );

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDelete = (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      deleteAddressMutation.mutate(addressId);
    }
  };

  const handleSetDefault = (addressId: string) => {
    setDefaultMutation.mutate(addressId);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleSubmitForm = (data: AddressFormData) => {
    saveAddressMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">Please login to manage addresses</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" className="py-12" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorMessage
            title="Failed to load addresses"
            message="We couldn't load your saved addresses. Please try again."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Saved Addresses</h1>
            <p className="text-gray-600 mt-1">
              Manage your delivery addresses
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Addresses Grid */}
        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Default Address First */}
            {defaultAddress && (
              <AddressCard
                address={defaultAddress}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
                isDefault={true}
              />
            )}
            
            {/* Other Addresses */}
            {addresses
              .filter(addr => !addr.isDefault)
              .map(address => (
                <AddressCard
                  key={address._id}
                  address={address}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSetDefault={handleSetDefault}
                  isDefault={false}
                />
              ))}
          </div>
        ) : (
          <EmptyState
            title="No addresses saved"
            description="Add your first delivery address to get started with orders."
            action={{
              label: 'Add Address',
              onClick: handleAddNew
            }}
          />
        )}

        {/* Address Form Modal */}
        {showForm && (
          <AddressForm
            address={editingAddress}
            onSubmit={handleSubmitForm}
            onCancel={handleCloseForm}
            isSubmitting={saveAddressMutation.isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default Addresses;
