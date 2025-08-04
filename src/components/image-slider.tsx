'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"

const sliderImages = [
  { src: 'https://placehold.co/1600x600.png', alt: 'Epic battle scene from Free Fire', dataAiHint: 'gaming battle' },
  { src: 'https://placehold.co/1600x600.png', alt: 'Promotional banner for new game items', dataAiHint: 'gaming characters' },
  { src: 'https://placehold.co/1600x600.png', alt: 'Close-up of a rare in-game weapon', dataAiHint: 'game weapon' },
  { src: 'https://placehold.co/1600x600.png', alt: 'Characters showing off new skins', dataAiHint: 'action scene' },
];

export default function ImageSlider() {
  return (
    <section className="w-full">
      <Carousel 
        className="w-full"
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {sliderImages.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  data-ai-hint={image.dataAiHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/40 border-none" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/40 border-none" />
      </Carousel>
    </section>
  );
}
