'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="relative w-48 h-48 animation-pulse-vanish">
        <Image
          src="/img/load.png"
          alt="Loading Garena Gears"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
