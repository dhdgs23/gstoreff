'use client';

import Link from 'next/link';
import { Menu, ShoppingCart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { useState } from 'react';
import NavigationLinks from './navigation-links';
import Image from 'next/image';
import type { User, Notification as NotificationType } from '@/lib/definitions';
import NotificationBell from './notification-bell';
import { logoutUser } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';


interface HeaderProps {
  user: User | null;
  notifications: NotificationType[];
}

export default function Header({ user, notifications }: HeaderProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
  };

  const logoutTrigger = user?.visualGamingId ? (
     <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="hidden md:flex">Logout</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action has permanent consequences. Your current Gaming ID ({user.gamingId}) will be deleted, and your Visual ID ({user.visualGamingId}) will become your new, real Gaming ID. All of your coins and order history will be transferred. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout}>Confirm & Logout</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : (
    <Button variant="ghost" onClick={handleLogout} className="hidden md:flex">Logout</Button>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 md:px-6 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
           <Image src="/img/garena.png" alt="Garena Logo" width={32} height={32} className="h-8 w-8" />
          <span className="font-bold font-headline text-lg">Garena</span>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
             <NavigationLinks notifications={notifications} user={user} />
             {user && logoutTrigger}
          </nav>

          <div className="flex items-center md:hidden">
             {notifications.length > 0 && <NotificationBell notifications={notifications} />}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/order">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Order</span>
              </Link>
            </Button>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-6 pt-10">
                  <Link
                    href="/"
                    className="flex items-center gap-2 mb-4"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <Image src="/img/garena.png" alt="Garena Logo" width={32} height={32} className="h-8 w-8" />
                    <span className="font-bold font-headline text-lg">
                      Garena
                    </span>
                  </Link>
                  <NavigationLinks mobile onLinkClick={() => setIsSheetOpen(false)} notifications={notifications} user={user} />
                  {user && (
                    <Button variant="outline" onClick={async () => {
                      await handleLogout();
                      setIsSheetOpen(false);
                    }}>
                      <LogOut className="mr-2" /> Logout
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
