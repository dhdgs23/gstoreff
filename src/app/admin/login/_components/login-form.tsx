'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { verifyAdminPassword } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Verifying...' : 'Login'}
    </Button>
  );
}

export default function LoginForm() {
  const { toast } = useToast();
  
  const [state, formAction] = useActionState(async (_:any, formData: FormData) => {
    const password = formData.get('password') as string;
    const result = await verifyAdminPassword(password);
    if (!result.success) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: result.message
        })
    }
    // The redirect is now handled by the server action, so no client-side navigation is needed.
  }, { success: false, message: '' });


  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
