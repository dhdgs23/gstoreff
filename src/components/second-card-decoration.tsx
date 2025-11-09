'use client';

import Image from 'next/image';

export default function SecondCardDecoration() {
  return (
    <div className="absolute -top-6 -left-14 z-10 w-50 h-50 pointer-events-none">
      <Image
        src="https://res.cloudinary.com/dlvoikod1/image/upload/v1762671985/VID-20251109-123336-unscreen_jpkqzf.gif"
        alt="Card Decoration"
        width={180}
        height={180}
        className="object-contain"
      />
    </div>
  );
}
