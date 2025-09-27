"use client";

import { useAuth } from './AuthProvider';

interface RoleSwitcherProps {
  className?: string;
}

export function RoleSwitcher({ className }: RoleSwitcherProps) {
  const { role, setRole, availableRoles } = useAuth();
  const classes = ['flex items-center gap-2 text-xs font-medium text-gray-500', className]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={classes}>
      Role
      <select
        value={role}
        onChange={(event) => setRole(event.target.value as typeof role)}
        className="rounded-full border border-[var(--border)] bg-white/70 px-3 py-1 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
      >
        {availableRoles.map((availableRole) => (
          <option key={availableRole} value={availableRole}>
            {availableRole}
          </option>
        ))}
      </select>
      {/* //no select just role details */}
      {/* <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
        {role}
      </span> */}
    </label>
  );
}
