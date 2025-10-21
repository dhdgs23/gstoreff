
'use client';

import { cn } from '@/lib/utils';

interface ProductTagProps {
  tag: string;
  color?: 'green' | 'red';
}

export default function ProductTag({ tag, color = 'green' }: ProductTagProps) {
  if (!tag) {
    return null;
  }
  
  const colorClasses = {
      green: {
          bg: 'bg-green-600',
          border: 'border-t-green-600'
      },
      red: {
          bg: 'bg-red-600',
          border: 'border-t-red-600'
      }
  }

  return (
    <div className="absolute -top-5 -right-2 z-10 drop-shadow-lg" style={{ transform: 'rotate(4deg)' }}>
        <div 
          className={cn(
            'relative text-white',
            'text-xs font-bold uppercase tracking-wider',
            'px-2 py-1 rounded-md',
            'overflow-hidden animate-glowing-ray',
            colorClasses[color].bg
          )}
        >
          {tag}
        </div>
        <div className={cn(
            "absolute top-full right-2 w-0 h-0",
            "border-l-[10px] border-l-transparent",
            "border-r-[0px] border-r-transparent",
            "border-t-[12px]",
            colorClasses[color].border
        )}></div>
    </div>
  );
}
