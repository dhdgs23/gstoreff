'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// This provider is a placeholder for now. 
// The core logic is moved to the GamingIdModal to ensure we have a user context.
export default function FirebaseMessagingProvider({children}: {children: React.ReactNode}) {
  const { toast } = useToast();

  useEffect(() => {
    // You can add any additional app-wide messaging listeners here if needed.
    // For example, listening for messages when the app is in the foreground.
  }, [toast]);
  
  return <>{children}</>;
}
