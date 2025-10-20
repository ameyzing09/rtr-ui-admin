'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Lock,
  Mail,
} from 'lucide-react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Skeleton from '@/components/ui/Skeleton';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import ResetPasswordModal from '@/components/users/ResetPasswordModal';
import { listUsersAction } from '@/lib/actions/user';
import type { User } from '@/domain/users/schemas';

interface UsersListClientProps {
  tenantId?: string;
}

export default function UsersListClient({ tenantId }: UsersListClientProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  // Load users
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await listUsersAction({
        tenant_id: tenantId as string | undefined,
        search: search || undefined,
        page,
        limit,
      });

      if (result.success) {
        setUsers(result.data.users);
        setTotal(result.data.total);
      } else {
        // Use user-friendly message if available, otherwise fall back to technical error
        setError(result.userMessage || result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, search, page, limit]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleResetPassword = async (user: User) => {
    setSelectedUser(user);
    setShowResetModal(true);
  };

  const handleResetSuccess = async () => {
    setShowResetModal(false);
    // Reload users to update must_change_password status
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

  const totalPages = Math.ceil(total / limit);

  if (error && !users.length) {
    return (
      <ErrorBanner
        error={{
          code: 'SERVER',
          retryable: true,
          details: { message: error },
          userMessage: { title: 'Failed to Load Users', message: error },
        }}
        onRetry={loadUsers}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
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

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Input
          label="Search users"
          type="text"
          placeholder="Search by name or email..."
          leftIcon={Search}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Loading state */}
      {isLoading && !users.length && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width="100%" height="60px" />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Last Login</th>
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
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.last_login
                          ? new Intl.DateTimeFormat('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(new Date(user.last_login))
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Lock}
                          onClick={() => handleResetPassword(user)}
                        >
                          Reset Password
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 px-2">
                Page {page} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!isLoading && users.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Try adjusting your search criteria.</p>
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
