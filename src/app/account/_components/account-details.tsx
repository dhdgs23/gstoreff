'use client';

import { logout } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChangePasswordForm from './change-password-form';
import ChangeUsernameForm from './change-username-form';
import ReferralSystem from './referral-system';

interface AccountDetailsProps {
  username: string;
}

export default function AccountDetails({ username }: AccountDetailsProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <ReferralSystem />
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Welcome, {username}!</CardTitle>
            <CardDescription>Manage your account settings below.</CardDescription>
          </div>
          <form action={logout}>
            <Button variant="outline" type="submit">Log Out</Button>
          </form>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="change-password">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="change-password">Change Password</TabsTrigger>
              <TabsTrigger value="change-username">Change Username</TabsTrigger>
            </TabsList>
            <TabsContent value="change-password">
              <ChangePasswordForm />
            </TabsContent>
            <TabsContent value="change-username">
              <ChangeUsernameForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
