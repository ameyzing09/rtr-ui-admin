'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Lock,
  UserPlus,
  Users,
} from 'lucide-react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Skeleton from '@/components/ui/Skeleton';
import ResetPasswordModal from '@/components/users/ResetPasswordModal';
import CreateMemberModal from '@/components/members/CreateMemberModal';
import { listMembersAction, updateMemberAction, resetMemberPasswordAction } from '@/lib/actions/members';
import { useToastMessages } from '@/components/ui/ToastProvider';
import type { Member } from '@/domain/members/schemas';

interface MembersClientProps {
  initialMembers: Member[];
  currentUserId: string;
  canCreate: boolean;
  canUpdate: boolean;
  canResetPassword: boolean;
}

const ROLE_OPTIONS = ['ADMIN', 'HR', 'INTERVIEWER'] as const;
const PAGE_SIZE = 10;

export default function MembersClient({
  initialMembers,
  currentUserId,
  canCreate,
  canUpdate,
  canResetPassword,
}: MembersClientProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetTarget, setResetTarget] = useState<Member | null>(null);

  // Action in-progress state
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  const { success: toastSuccess, error: toastError } = useToastMessages();

  // Client-side filtering
  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.email ?? '').toLowerCase().includes(q)
    );
  }, [members, search]);

  // Client-side pagination
  const totalPages = Math.ceil(filteredMembers.length / PAGE_SIZE);
  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredMembers.slice(start, start + PAGE_SIZE);
  }, [filteredMembers, page]);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listMembersAction();
      if (result.success) {
        setMembers(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // Role change handler
  const handleRoleChange = async (member: Member, newRole: string) => {
    if (member.id === currentUserId) return;
    setUpdatingMemberId(member.id);
    try {
      const result = await updateMemberAction(member.id, { role: newRole });
      if (result.success) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === member.id ? { ...m, role: result.data.user.role } : m
          )
        );
        toastSuccess('Role Updated', `${member.name} is now ${newRole}`);
      } else {
        toastError('Update Failed', result.error);
      }
    } catch (err) {
      toastError('Update Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setUpdatingMemberId(null);
    }
  };

  // Active toggle handler
  const handleToggleActive = async (member: Member) => {
    if (member.id === currentUserId) return;
    const newActive = !member.is_active;
    setUpdatingMemberId(member.id);
    try {
      const result = await updateMemberAction(member.id, { is_active: newActive });
      if (result.success) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === member.id ? { ...m, is_active: result.data.user.is_active } : m
          )
        );
        toastSuccess(
          newActive ? 'Member Activated' : 'Member Deactivated',
          `${member.name} has been ${newActive ? 'activated' : 'deactivated'}`
        );
      } else {
        toastError('Update Failed', result.error);
      }
    } catch (err) {
      toastError('Update Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'HR':
        return 'bg-blue-100 text-blue-800';
      case 'INTERVIEWER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {members.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={loadMembers}
            disabled={isLoading}
            size="sm"
          >
            Refresh
          </Button>
          {canCreate && (
            <Button
              icon={UserPlus}
              onClick={() => setShowCreateModal(true)}
              size="sm"
            >
              Add Member
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Input
          label="Search members"
          type="text"
          placeholder="Search by name or email..."
          leftIcon={Search}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Failed to load members</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadMembers}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && members.length === 0 && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width="100%" height="60px" />
          ))}
        </div>
      )}

      {/* Members table */}
      {!isLoading && paginatedMembers.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {paginatedMembers.map((member) => {
                    const isSelf = member.id === currentUserId;
                    const isUpdating = updatingMemberId === member.id;

                    return (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            {member.name}
                            {isSelf && (
                              <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {member.email || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {canUpdate && !isSelf ? (
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member, e.target.value)}
                              disabled={isUpdating}
                              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                            >
                              {ROLE_OPTIONS.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}
                            >
                              {member.role}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {canUpdate && !isSelf ? (
                            <button
                              onClick={() => handleToggleActive(member)}
                              disabled={isUpdating}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer disabled:opacity-50 ${
                                member.is_active
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                              title={
                                isSelf
                                  ? 'You cannot deactivate your own account'
                                  : member.is_active
                                    ? 'Click to deactivate'
                                    : 'Click to activate'
                              }
                            >
                              {member.is_active ? 'Active' : 'Inactive'}
                            </button>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                member.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {member.is_active ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }).format(member.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {canResetPassword && !isSelf && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Lock}
                              onClick={() => setResetTarget(member)}
                              disabled={isUpdating}
                            >
                              Reset Password
                            </Button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredMembers.length > PAGE_SIZE && (
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
                {Math.min(page * PAGE_SIZE, filteredMembers.length)} of{' '}
                {filteredMembers.length} members
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={ChevronLeft}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 px-2">
                  Page {page} of {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Empty state */}
      {!isLoading && filteredMembers.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {search ? 'No members found' : 'No team members yet'}
          </h3>
          <p className="text-gray-600">
            {search
              ? 'Try adjusting your search criteria.'
              : 'Add your first team member to get started.'}
          </p>
        </div>
      )}

      {/* Create member modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateMemberModal
            key="create-modal"
            onClose={() => setShowCreateModal(false)}
            onMemberCreated={loadMembers}
          />
        )}
      </AnimatePresence>

      {/* Reset password modal */}
      <AnimatePresence>
        {resetTarget && (
          <ResetPasswordModal
            key="reset-modal"
            userId={resetTarget.id}
            userName={resetTarget.name}
            userEmail={resetTarget.email || '—'}
            onClose={() => setResetTarget(null)}
            onSuccess={() => {
              setResetTarget(null);
              loadMembers();
            }}
            resetAction={async (userId, request) => {
              const result = await resetMemberPasswordAction(userId, request);
              if (result.success) {
                return {
                  success: true as const,
                  data: {
                    temporary_password: result.data.temporary_password,
                  },
                };
              }
              return {
                success: false as const,
                error: result.error,
              };
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
