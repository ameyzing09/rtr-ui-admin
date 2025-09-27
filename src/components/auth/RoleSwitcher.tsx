'use client';

import { useAuth } from './AuthProvider';

interface RoleSwitcherProps {
  className?: string;
}

export function RoleSwitcher({ className }: RoleSwitcherProps) {
  const { role, availableRoles } = useAuth();
  if (!role) {
    return null;
  }

  const classes = ['flex items-center gap-2 text-xs font-medium text-gray-500', className]
    .filter(Boolean)
    .join(' ');

  if (availableRoles.length > 1) {
    return (
      <label className={classes}>
        Role
        <select
          value={role}
          disabled
          className="rounded-full border border-[var(--border)] bg-white/70 px-3 py-1 text-sm font-medium text-gray-700 shadow-sm"
        >
          {availableRoles.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div className={classes}>
      Role
      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
        {role}
      </span>
    </div>
  );
}
