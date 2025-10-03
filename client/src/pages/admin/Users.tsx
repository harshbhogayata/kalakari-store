import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Users, UserCheck, UserX, Mail, Phone, Calendar } from 'lucide-react';
import api from '../../utils/api';
import { User } from '../../types';
import toast from 'react-hot-toast';

const AdminUsers: React.FC = () => {
  const [roleFilter, setRoleFilter] = useState('');

  const { data: usersData, isLoading, refetch } = useQuery(
    ['admin-users', roleFilter],
    async () => {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      
      const response = await api.get(`/admin/users?${params.toString()}`);
      return response.data.data;
    }
  );

  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive });
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-600 mt-2">View and manage all platform users</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRoleFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === '' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Users
            </button>
            {['customer', 'artisan', 'admin'].map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  roleFilter === role 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {usersData?.users?.length > 0 ? (
          <div className="space-y-6">
            {usersData.users.map((user: User) => (
              <div key={user._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-600">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{user.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'artisan'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateUserStatus(user._id, !user.isActive)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                          user.isActive
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <UserX className="w-4 h-4" />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Email: {user.email}</p>
                      <p>Phone: {user.phone}</p>
                      <p>Role: {user.role}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Account Status</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Status: {user.isActive ? 'Active' : 'Inactive'}</p>
                      <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                      <p>Last Updated: {new Date(user.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {user.addresses && user.addresses.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Saved Addresses</h4>
                    <div className="space-y-2">
                      {user.addresses.map((address, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          <p>{address.name} - {address.street}, {address.city}, {address.state} - {address.pincode}</p>
                          {address.isDefault && (
                            <span className="text-xs text-primary-600">(Default)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No users found</h2>
            <p className="text-gray-600">
              {roleFilter 
                ? `No ${roleFilter} users found.`
                : 'No users have registered yet.'
              }
            </p>
          </div>
        )}

        {usersData?.pagination && usersData.pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: usersData.pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`px-3 py-2 rounded ${
                    page === usersData.pagination.current
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

export default AdminUsers;
