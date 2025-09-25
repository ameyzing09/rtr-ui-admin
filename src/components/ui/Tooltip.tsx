import React from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  className?: string;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  disabled = false,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (disabled || !content) return;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // Position calculations
  const getTooltipPosition = () => {
    const positions = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    };
    return positions[position];
  };

  const getArrowPosition = () => {
    const arrows = {
      top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-[var(--card)]',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-[var(--card)]',
      left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-[var(--card)]',
      right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-[var(--card)]',
    };
    return arrows[position];
  };

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && content && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 px-2 py-1 text-sm text-[var(--app-fg)]
            bg-[var(--card)] border border-[var(--border)]
            rounded shadow-lg whitespace-nowrap
            pointer-events-none
            ${getTooltipPosition()}
            ${className}
          `}
          role="tooltip"
        >
          {content}
          
          {/* Arrow */}
          <div
            className={`
              absolute border-4
              ${getArrowPosition()}
            `}
          />
        </div>
      )}
    </div>
  );
}

// Pre-built tooltip variants
export function TooltipInfo({ 
  children, 
  content,
  ...props 
}: Omit<TooltipProps, 'children'> & { children: React.ReactNode }) {
  return (
    <Tooltip content={content} {...props}>
      <span className="inline-flex items-center justify-center w-4 h-4 text-xs bg-blue-100 text-blue-600 rounded-full cursor-help">
        i
      </span>
      {children}
    </Tooltip>
  );
}

export function TooltipHelp({ 
  children, 
  content,
  ...props 
}: Omit<TooltipProps, 'children'> & { children: React.ReactNode }) {
  return (
    <Tooltip content={content} {...props}>
      <span className="inline-flex items-center justify-center w-4 h-4 text-xs bg-gray-100 text-gray-600 rounded-full cursor-help">
        ?
      </span>
      {children}
    </Tooltip>
  );
}
