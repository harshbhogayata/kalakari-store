import React from 'react';
import { MapPin, Edit2, Trash2, Check } from 'lucide-react';
import { Address } from '../types';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
  isDefault?: boolean;
}

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDefault = false
}) => {
  return (
    <div className={`
      relative bg-white border-2 rounded-lg p-4 transition-all
      ${isDefault ? 'border-primary-500 bg-primary-50/30' : 'border-gray-200 hover:border-gray-300'}
    `}>
      {/* Default Badge */}
      {isDefault && (
        <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
          <Check className="w-3 h-3" />
          <span>Default</span>
        </div>
      )}

      {/* Address Type */}
      <div className="flex items-center space-x-2 mb-3">
        <MapPin className="w-5 h-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900 capitalize">{address.type}</h3>
      </div>

      {/* Address Details */}
      <div className="space-y-1 text-sm text-gray-600 mb-4">
        <p className="font-medium text-gray-900">{address.name}</p>
        <p>{address.street}</p>
        <p>{address.city}, {address.state} - {address.pincode}</p>
        <p className="flex items-center space-x-2 mt-2">
          <span className="font-medium">Phone:</span>
          <span>{address.phone}</span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
        {!isDefault && (
          <button
            onClick={() => onSetDefault(address._id)}
            className="flex-1 px-3 py-2 text-sm text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
          >
            Set as Default
          </button>
        )}
        
        <button
          onClick={() => onEdit(address)}
          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Edit Address"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onDelete(address._id)}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Address"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AddressCard;
