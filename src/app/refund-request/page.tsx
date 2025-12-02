
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { getUserData } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RefundRequestPage() {
  const [transactionId, setTransactionId] = useState('');
  const [gamingId, setGamingId] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isLoadingId, setIsLoadingId] = useState(true);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUserId() {
      setIsLoadingId(true);
      const user = await getUserData();
      if (user) {
        setGamingId(user.visualGamingId || user.gamingId);
      }
      setIsLoadingId(false);
    }
    fetchUserId();
  }, []);

  const handleGamingIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    const numericValue = value.replace(/\D/g, '');
    setGamingId(numericValue);
  };
  
  const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    const numericValue = value.replace(/\D/g, '');
    setContactNumber(numericValue);
  };

  const handleSendEmail = () => {
    const recipient = 'garenaffmaxstore@gmail.com';
    const subject = `Refund Request - ID: ${gamingId} - UTR: ${transactionId}`;
    const body = `
Gaming ID:
${gamingId}

Contact Number:
${contactNumber}

UTR/Transaction ID:
${transactionId}

Reason for refund:
${message}
    `;

    if (isMobile) {
      const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
    } else {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, '_blank');
    }
    
    // Provide feedback to the user
    toast({
      title: "Email Opened",
      description: "Your email client has been opened with the refund details.",
    });

    // Clear the fields
    setTransactionId('');
    setContactNumber('');
    setMessage('');
  };

  return (
    <div className="container mx-auto px-6 py-16 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Refund Request</CardTitle>
          <CardDescription>
            Fill out the form below to submit a refund request. This will open your default email client.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
            <Label htmlFor="gaming-id">Your Gaming ID</Label>
            <div className="relative">
              <Input
                id="gaming-id"
                placeholder="Enter your Gaming ID"
                value={gamingId}
                onChange={handleGamingIdChange}
                type="tel"
                pattern="[0-9]*"
                disabled={isLoadingId}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-number">Contact Number</Label>
            <Input
              id="contact-number"
              placeholder="Enter your contact number"
              value={contactNumber}
              onChange={handleContactNumberChange}
              type="tel"
              pattern="[0-9]*"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transaction-id">UTR/Transaction ID</Label>
            <Input
              id="transaction-id"
              placeholder="Enter your transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Why do you want a refund?</Label>
            <Textarea
              id="message"
              placeholder="Please describe the issue..."
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSendEmail} size="lg" className="w-full" disabled={!gamingId || !transactionId || !message || !contactNumber}>
            Send in Email
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
