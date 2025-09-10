'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import type { Notification } from '@/lib/definitions';
import NotificationBell from './notification-bell';


const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/account', label: 'Account' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'T&C' },
  { href: '/refund', label: 'Refund Policy' },
  { href: '/contact', label: 'Contact' },
];

interface NavigationLinksProps {
  mobile?: boolean;
  onLinkClick?: () => void;
  notifications: Notification[];
}

export default function NavigationLinks({ mobile, onLinkClick, notifications = [] }: NavigationLinksProps) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <>
        {navLinks.map(({ href, label }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              'text-lg font-medium transition-colors hover:text-primary',
              pathname === href && 'text-primary'
            )}
            onClick={onLinkClick}
          >
            {label}
          </Link>
        ))}
      </>
    );
  }

  return (
    <>
      {notifications.length > 0 && <NotificationBell notifications={notifications} />}
      <Button asChild className={cn(
        'bg-primary/10 hover:bg-primary/20 text-primary',
        pathname === '/order' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
      )}>
        <Link href="/order">
          Order
          <ShoppingCart className="h-4 w-4" />
        </Link>
      </Button>
      {navLinks.map(({ href, label }) => (
        <Link
          key={label}
          href={href}
          className={cn(
            'transition-colors hover:text-primary',
            pathname === href ? 'text-primary font-semibold border-b-2 border-primary' : ''
          )}
        >
          {label}
        </Link>
      ))}
    </>
  );
}
