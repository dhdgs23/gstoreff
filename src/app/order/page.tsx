import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OrderPage() {
  return (
    <div className="container mx-auto px-6 py-16 text-center">
      <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-8">
        Your Order Shows Here
      </h1>
      <Button asChild size="lg">
        <Link href="/refund-request">Get Refund Request</Link>
      </Button>
    </div>
  );
}
