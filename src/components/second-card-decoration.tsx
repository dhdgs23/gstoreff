'use client';

import Image from 'next/image';

export default function SecondCardDecoration() {
  return (
    <div className="absolute -top-4 -left-12 z-10 w-50 h-50 pointer-events-none">
      <Image
        src="https://res.cloudinary.com/dlvoikod1/image/upload/v1762668141/images__1_-removebg-preview_fylmgh.png"
        alt="Card Decoration"
        width={160}
        height={160}
        className="object-contain"
      />
    </div>
  );
}
