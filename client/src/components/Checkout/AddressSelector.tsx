import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Plus, MapPin, Check } from 'lucide-react';
import api from '../../utils/api';
import { Address } from '../../types';
import AddressForm, { AddressFormData } from '../AddressForm';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

interface AddressSelectorProps {
  selectedAddressId: string | null;
  onSelectAddress: (address: Address) => void;
  onAddAddress?: (address: Address) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddressId,
  onSelectAddress,
  onAddAddress
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch addresses
  const { data: addressesData, isLoading } = useQuery(
    ['addresses'],
    async () => {
      const endpoint = '/api/addresses';
      const response = await api.get(endpoint);
      return response.data.data.addresses || [];
    }
  );

  const addresses: Address[] = addressesData || [];

  const handleAddAddress = async (data: AddressFormData) => {
    try {
      const endpoint = '/api/addresses';
      const response = await api.post(endpoint, data);
      
      if (response.data.success) {
        const newAddress = response.data.data.address;
        toast.success('Address added successfully');
        setShowAddForm(false);
        
        // Auto-select the new address
        onSelectAddress(newAddress);
        onAddAddress?.(newAddress);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add address');
      throw error;
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="py-8" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Delivery Address</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address List */}
      {addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address._id}
              onClick={() => onSelectAddress(address)}
              className={`
                relative p-4 border-2 rounded-lg cursor-pointer transition-all
                ${selectedAddressId === address._id
                  ? 'border-primary-500 bg-primary-50/50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              {/* Selection Indicator */}
              {selectedAddressId === address._id && (
                <div className="absolute top-3 right-3 bg-primary-500 text-white rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}

              {/* Address Details */}
              <div className="pr-10">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-gray-900 capitalize">{address.type}</span>
                  {address.isDefault && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
                
                <p className="font-medium text-gray-900">{address.name}</p>
                <p className="text-sm text-gray-600">{address.street}</p>
                <p className="text-sm text-gray-600">
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No addresses saved</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            Add Your First Address
          </button>
        </div>
      )}

      {/* Add Address Form Modal */}
      {showAddForm && (
        <AddressForm
          onSubmit={handleAddAddress}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

export default AddressSelector;
