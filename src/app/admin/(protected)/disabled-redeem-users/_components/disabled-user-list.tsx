'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { setUserRedeemDisabled, getDisabledRedeemUsers } from '@/app/actions';
import type { User } from '@/lib/definitions';
import { Input } from '@/components/ui/input';

interface DisabledUserListProps {
  initialUsers: User[];
  initialHasMore: boolean;
}

export default function DisabledUserList({ initialUsers, initialHasMore }: DisabledUserListProps) {
  const [users, setUsers] = useState(initialUsers);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setUsers(initialUsers);
    setHasMore(initialHasMore);
    setPage(1);
  }, [initialUsers, initialHasMore]);

  const handleLoadMore = async () => {
    startTransition(async () => {
      const nextPage = page + 1;
      const search = searchParams.get('search') || '';
      const { users: newUsers, hasMore: newHasMore } = await getDisabledRedeemUsers(search, nextPage);
      setUsers(prev => [...prev, ...newUsers]);
      setHasMore(newHasMore);
      setPage(nextPage);
    });
  };

  const handleEnable = (gamingId: string) => {
    startTransition(async () => {
      const result = await setUserRedeemDisabled(gamingId, false);
      if (result.success) {
        toast({ title: 'Success', description: 'User redeem payments enabled.' });
        setUsers(users.filter(u => u.gamingId !== gamingId));
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get('search') as string;
    const params = new URLSearchParams(searchParams);
    params.set('search', searchQuery);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Disabled Redeem Users</CardTitle>
            <CardDescription>
              These users cannot use the redeem code payment option.
            </CardDescription>
          </div>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              name="search"
              placeholder="Search by Gaming ID..."
              defaultValue={searchParams.get('search') || ''}
              className="w-56"
            />
            <Button type="submit" variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No users found with redeem payments disabled.</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user._id.toString()} className="flex items-center justify-between p-4 bg-muted/50">
                <div>
                  <p className="font-semibold font-mono">{user.gamingId}</p>
                </div>
                <Button
                  onClick={() => handleEnable(user.gamingId)}
                  disabled={isPending}
                  variant="secondary"
                >
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Enable
                </Button>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
       {hasMore && (
        <CardFooter className="justify-center">
            <Button onClick={handleLoadMore} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load More
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
