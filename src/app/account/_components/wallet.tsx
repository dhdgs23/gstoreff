'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { requestWithdrawal } from '@/app/actions';
import { useFormStatus } from 'react-dom';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { Withdrawal } from '@/lib/definitions';
import { Banknote, Loader2, WalletCards } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WalletProps {
  balance: number;
  withdrawals: Withdrawal[];
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : 'Request Withdrawal'}
        </Button>
    )
}

export default function Wallet({ balance, withdrawals }: WalletProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleWithdrawalRequest = async (formData: FormData) => {
    const result = await requestWithdrawal(formData);
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      setIsDialogOpen(false);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WalletCards className="w-6 h-6 text-primary" />
          My Wallet
        </CardTitle>
        <CardDescription>Your referral earnings and withdrawal history.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 rounded-lg bg-gradient-to-tr from-primary/80 to-primary text-primary-foreground text-center">
            <p className="text-sm uppercase tracking-wider">Current Balance</p>
            <p className="text-4xl font-bold font-sans">₹{balance.toFixed(2)}</p>
        </div>
        
        <div>
            <h3 className="font-semibold mb-2">Withdrawal History</h3>
            {withdrawals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No withdrawal requests yet.</p>
            ) : (
                <ScrollArea className="h-48">
                    <div className="space-y-3 pr-4">
                    {withdrawals.map(w => (
                        <div key={w._id.toString()} className="flex justify-between items-center text-sm p-3 rounded-md bg-muted/50">
                            <div>
                                <p className="font-medium">Amount: ₹{w.amount.toFixed(2)} ({w.method})</p>
                                <p className="text-xs text-muted-foreground">{new Date(w.createdAt).toLocaleString()}</p>
                            </div>
                            <Badge variant={
                                w.status === 'Completed' ? 'default' :
                                w.status === 'Pending' ? 'secondary' : 'destructive'
                            }>{w.status}</Badge>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
            )}
        </div>
      </CardContent>
      <CardFooter>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" disabled={balance <= 0}>
                <Banknote className="mr-2"/>
                Withdraw Funds
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Withdrawal</DialogTitle>
              <DialogDescription>
                Select a withdrawal method and fill in the details. The amount will be deducted from your wallet immediately.
              </DialogDescription>
            </DialogHeader>
            <form action={handleWithdrawalRequest}>
              <Tabs defaultValue="upi">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upi">UPI</TabsTrigger>
                  <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
                </TabsList>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (₹)</Label>
                        <Input id="amount" name="amount" type="number" step="0.01" required max={balance} />
                    </div>
                </div>
                <TabsContent value="upi">
                  <input type="hidden" name="method" value="UPI" />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input id="upiId" name="upiId" placeholder="yourname@upi" required/>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="bank">
                  <input type="hidden" name="method" value="Bank" />
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input id="bankName" name="bankName" placeholder="e.g. State Bank of India" required/>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input id="accountNumber" name="accountNumber" placeholder="Enter your bank account number" required/>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="ifscCode">IFSC Code</Label>
                        <Input id="ifscCode" name="ifscCode" placeholder="Enter 11-digit IFSC code" required/>
                     </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter className="mt-6">
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <SubmitButton />
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
