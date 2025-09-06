'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { sendNotification, sendNotificationToAll } from '@/app/actions';
import { Loader2, Send, SendToBack } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

function SubmitButton({ action }: { action: 'single' | 'all' }) {
    const { pending } = useFormStatus();
    if (action === 'all') {
        return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button type="button" variant="secondary" className="w-full" disabled={pending}>
                        <SendToBack className="mr-2 h-4 w-4" />
                        Send to All Users
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will send the notification to every single user. This action cannot be undone. Are you sure you want to proceed?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                             <Button type="submit" formAction={sendNotificationToAll} disabled={pending}>
                                {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Yes, Send to All
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )
    }

    return (
        <Button type="submit" formAction={sendNotification} className="w-full" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {pending ? 'Sending...' : 'Send to Specific User'}
        </Button>
    )
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const [formKey, setFormKey] = useState(Date.now()); // To reset the form

  const handleFormAction = async (action: (formData: FormData) => Promise<{ success: boolean; message: string }>, formData: FormData) => {
    const result = await action(formData);
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      setFormKey(Date.now()); // Reset form by changing key
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
          <CardDescription>
            Send a message and an optional image to a specific user or to all users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form key={formKey} action={(formData) => handleFormAction(sendNotification, formData)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="gamingId">User's Gaming ID (for single user)</Label>
              <Input id="gamingId" name="gamingId" placeholder="Enter Gaming ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" required placeholder="Your notification message..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input id="imageUrl" name="imageUrl" placeholder="https://example.com/image.png" />
            </div>
            <div className="space-y-2">
                <SubmitButton action="single" />
                <SubmitButton action="all" />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
