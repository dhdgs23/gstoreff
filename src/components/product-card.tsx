import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ProductCardProps {
  name: string;
  price: number;
  imageUrl: string;
  dataAiHint: string;
}

export default function ProductCard({ name, price, imageUrl, dataAiHint }: ProductCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image src={imageUrl} alt={name} fill className="object-cover" data-ai-hint={dataAiHint}/>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg font-headline font-semibold">{name}</CardTitle>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base transition-transform duration-200 hover:scale-105">
          Buy (${price})
        </Button>
      </CardFooter>
    </Card>
  );
}
