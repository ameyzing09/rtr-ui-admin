'use client';

import { useState } from 'react';
import { applyTheme, type Theme } from '@/lib/theme/tokens';

const themes: { value: Theme; label: string }[] = [
  { value: 'default', label: 'Default (Blue)' },
  { value: 'tenant-a', label: 'Tenant A (Red)' },
  { value: 'tenant-b', label: 'Tenant B (Green)' },
  { value: 'tenant-c', label: 'Tenant C (Purple)' },
];

export default function ThemeDemo() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('default');

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme Switcher</h3>
      <p className="text-sm text-gray-600 mb-4">
        Switch between different tenant themes to see the glassmorphism navbar change colors.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.value}
            onClick={() => handleThemeChange(theme.value)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              border border-gray-200
              ${
                currentTheme === theme.value
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {theme.label}
          </button>
        ))}
      </div>
    </div>
  );
}
