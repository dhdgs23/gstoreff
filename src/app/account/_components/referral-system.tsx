'use client';

import { useState } from 'react';
import { generateReferralLink } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Loader2 } from 'lucide-react';

export default function ReferralSystem() {
  const [link, setLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateLink = async () => {
    setIsLoading(true);
    const result = await generateReferralLink();
    if (result.success && result.link) {
      setLink(result.link);
      toast({
        title: 'Success',
        description: result.message,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
    setIsLoading(false);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(link);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral System</CardTitle>
        <CardDescription>
          Generate a unique link to share with your friends. Earn rewards when they sign up and make a purchase!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {link ? (
          <div className="flex items-center space-x-2">
            <Input value={link} readOnly />
            <Button variant="outline" size="icon" onClick={handleCopyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button onClick={handleGenerateLink} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Generating...' : 'Generate Referral Link'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
