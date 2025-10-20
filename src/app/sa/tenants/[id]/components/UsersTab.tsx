'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Lock,
  Mail,
  RefreshCw,
  Search,
} from 'lucide-react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Skeleton from '@/components/ui/Skeleton';
import ResetPasswordModal from '@/components/users/ResetPasswordModal';
import { listUsersAction } from '@/lib/actions/user';
import type { User } from '@/domain/users/schemas';

interface UsersTabProps {
  tenantId: string;
}

export default function UsersTab({ tenantId }: UsersTabProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await listUsersAction({
        tenant_id: tenantId,
        search: search || undefined,
        page: 1,
        limit: 100,
      });

      if (result.success) {
        setUsers(result.data.users);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setShowResetModal(true);
  };

  const handleResetSuccess = async () => {
    setShowResetModal(false);
    await loadUsers();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-red-100 text-red-800';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'HR':
        return 'bg-blue-100 text-blue-800';
      case 'INTERVIEWER':
        return 'bg-green-100 text-green-800';
      case 'CANDIDATE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-900 mb-2">Error loading users</p>
          <p className="text-sm text-red-700 mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={loadUsers}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name or email..."
            leftIcon={Search}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button
          variant="outline"
          icon={RefreshCw}
          onClick={loadUsers}
          disabled={isLoading}
          size="sm"
        >
          Refresh
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && !users.length && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} width="100%" height="50px" />
          ))}
        </div>
      )}

      {/* Users table */}
      {!isLoading && users.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {users.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.must_change_password ? (
                          <span className="flex items-center gap-2 text-yellow-600">
                            <AlertCircle className="w-4 h-4" />
                            Must change
                          </span>
                        ) : (
                          <span className="text-green-600">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Lock}
                          onClick={() => handleResetPassword(user)}
                        >
                          Reset
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!isLoading && users.length === 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No users found for this tenant.</p>
        </div>
      )}

      {/* Reset password modal */}
      <AnimatePresence>
        {showResetModal && selectedUser && (
          <ResetPasswordModal
            key="reset-modal"
            userId={selectedUser.id}
            userName={selectedUser.name}
            userEmail={selectedUser.email}
            onClose={() => setShowResetModal(false)}
            onSuccess={handleResetSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
