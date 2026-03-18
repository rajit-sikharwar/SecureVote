import { useEffect, useState } from 'react';


interface ProgressBarProps {
  percent: number;
  color?: string;
  label?: string;
  count?: number;
}

export function ProgressBar({ percent, color = '#6366F1', label, count }: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Small delay to trigger animation on mount
    const timer = setTimeout(() => setWidth(percent), 50);
    return () => clearTimeout(timer);
  }, [percent]);

  return (
    <div className="w-full">
      {(label || count !== undefined) && (
        <div className="flex justify-between items-center mb-1.5 text-sm">
          {label && <span className="font-medium text-gray-900">{label}</span>}
          <div className="flex gap-2 text-gray-500">
            {count !== undefined && <span>{count} votes</span>}
            <span className="font-medium">{Math.round(percent)}%</span>
          </div>
        </div>
      )}
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
