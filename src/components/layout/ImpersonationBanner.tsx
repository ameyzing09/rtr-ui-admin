'use client';

import { X, AlertTriangle } from 'lucide-react';

interface ImpersonationBannerProps {
  tenantName: string;
  onExit: () => void;
}

export default function ImpersonationBanner({ tenantName, onExit }: ImpersonationBannerProps) {
  return (
    <div className="
      bg-gradient-to-r from-orange-500 to-red-500
      text-white px-4 py-2
      flex items-center justify-center gap-3
      text-sm font-medium
      shadow-md
    ">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span>
        Impersonating:{' '}
        <strong className="font-bold">{tenantName}</strong>
      </span>
      <button
        onClick={onExit}
        className="
          ml-2 px-3 py-1 rounded-full
          bg-white/20 hover:bg-white/30
          transition-smooth focus-ring-white
          flex items-center gap-1.5
        "
      >
        <X className="w-3.5 h-3.5" />
        Exit
      </button>
    </div>
  );
}
