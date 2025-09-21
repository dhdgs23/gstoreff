'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, ArrowUpDown, PersonStanding, Trash2, BadgeAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { findUserForVisualId, setVisualId, removeVisualId, getVisualizedUsers } from '../actions';
import type { User } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


interface VisualizeIdManagerProps {
  initialUsers: User[];
  initialHasMore: boolean;
  totalUsers: number;
}

const FormattedDate = ({ dateString }: { dateString?: string }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted || !dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
}


export default function VisualizeIdManager({ initialUsers, initialHasMore, totalUsers }: VisualizeIdManagerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const [users, setUsers] = useState(initialUsers);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHasMore);
    
    const [realGamingId, setRealGamingId] = useState('');
    const [visualGamingId, setVisualGamingId] = useState('');
    const [foundUser, setFoundUser] = useState<User | null>(null);

    const [isSearching, startSearchTransition] = useTransition();
    const [isSubmitting, startSubmitTransition] = useTransition();
    const [isLoadingMore, startLoadMoreTransition] = useTransition();

    const sort = searchParams.get('sort') || 'desc';
    const search = searchParams.get('search') || '';

    useEffect(() => {
        setUsers(initialUsers);
        setHasMore(initialHasMore);
        setPage(1);
    }, [initialUsers, initialHasMore]);

    const handleSearchUser = async () => {
        if (!realGamingId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a real Gaming ID to search.' });
            return;
        }
        startSearchTransition(async () => {
            const result = await findUserForVisualId(realGamingId);
            if (result.success && result.user) {
                setFoundUser(result.user);
                setVisualGamingId(result.user.visualGamingId || '');
                toast({ title: 'User Found', description: `You can now set a visual ID for ${result.user.gamingId}.` });
            } else {
                setFoundUser(null);
                toast({ variant: 'destructive', title: 'Not Found', description: result.message });
            }
        });
    };

    const handleSetVisualId = async () => {
        if (!foundUser) return;
        startSubmitTransition(async () => {
            const result = await setVisualId(foundUser.gamingId, visualGamingId);
            if (result.success) {
                toast({ title: 'Success', description: result.message });
                // Refresh the list
                router.refresh();
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.message });
            }
        });
    };

    const handleRemoveVisualId = async (gamingId: string) => {
        startSubmitTransition(async () => {
            const result = await removeVisualId(gamingId);
            if (result.success) {
                toast({ title: 'Success', description: result.message });
                setUsers(prev => prev.filter(u => u.gamingId !== gamingId));
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.message });
            }
        });
    };
    
    const handleSortToggle = () => {
        const newSort = sort === 'asc' ? 'desc' : 'asc';
        const params = new URLSearchParams(searchParams);
        params.set('sort', newSort);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const searchQuery = formData.get('search') as string;
        const params = new URLSearchParams(searchParams);
        params.set('search', searchQuery);
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleLoadMore = async () => {
        startLoadMoreTransition(async () => {
            const nextPage = page + 1;
            const { users: newUsers, hasMore: newHasMore } = await getVisualizedUsers(nextPage, search, sort);
            setUsers(prev => [...prev, ...newUsers]);
            setHasMore(newHasMore);
            setPage(nextPage);
        });
    };


    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PersonStanding />Set Visual Gaming ID</CardTitle>
                    <CardDescription>Assign a display-only ID to a user. This visual ID will be shown on their order page and purchase confirmations, but the real ID will be used for all backend operations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-end gap-2">
                        <div className="flex-grow space-y-2">
                            <Label htmlFor="realGamingId">Real Gaming ID</Label>
                            <Input id="realGamingId" value={realGamingId} onChange={(e) => setRealGamingId(e.target.value)} placeholder="Search for a user by their real ID"/>
                        </div>
                        <Button type="button" onClick={handleSearchUser} disabled={isSearching}>
                            {isSearching ? <Loader2 className="animate-spin"/> : <Search />}
                            Search User
                        </Button>
                    </div>

                    {foundUser && (
                        <div className="p-4 border rounded-md bg-muted/50 space-y-4">
                             <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-semibold">Editing User: <span className="font-mono">{foundUser.gamingId}</span></p>
                                    <p className="text-sm text-muted-foreground">This is the real ID used for purchases.</p>
                                </div>
                                {foundUser.visualGamingId && (
                                    <Badge variant="secondary">Visual ID Active</Badge>
                                )}
                            </div>
                           
                            <div className="space-y-2">
                                <Label htmlFor="visualGamingId">Visual Gaming ID</Label>
                                <Input id="visualGamingId" value={visualGamingId} onChange={(e) => setVisualGamingId(e.target.value)} placeholder="Enter the ID to display to the user"/>
                            </div>
                            <div className="flex justify-end">
                                <Button type="button" onClick={handleSetVisualId} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                                    Set Visual ID
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-2">
                           <CardTitle>Users with Visual IDs</CardTitle>
                           <Badge variant="secondary" className="text-sm">{totalUsers}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                                <Input name="search" placeholder="Search by any ID..." defaultValue={search} className="w-56"/>
                                <Button type="submit" variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
                            </form>
                            <Button variant="outline" onClick={handleSortToggle}>
                                <ArrowUpDown className="mr-2 h-4 w-4" />
                                {sort === 'desc' ? 'Newest First' : 'Oldest First'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                     {users.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No users with visual IDs found.</p>
                    ) : (
                        <div className="space-y-3">
                           {users.map(user => (
                                <div key={user._id.toString()} className="flex items-center justify-between p-4 border rounded-md bg-muted/20">
                                    <div>
                                        <p><strong>Real ID:</strong> <span className="font-mono">{user.gamingId}</span></p>
                                        <p><strong>Visual ID:</strong> <span className="font-mono font-bold text-primary">{user.visualGamingId}</span></p>
                                        <p className="text-xs text-muted-foreground">Set On: <FormattedDate dateString={user.visualIdSetAt as unknown as string} /></p>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon" disabled={isSubmitting}><Trash2/></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will remove the visual ID for user <span className="font-mono">{user.gamingId}</span>. They will see their real ID again.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleRemoveVisualId(user.gamingId)}>Remove Visual ID</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                           ))}
                        </div>
                    )}
                </CardContent>
                {hasMore && (
                    <CardFooter className="justify-center">
                        <Button onClick={handleLoadMore} disabled={isLoadingMore}>
                            {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Load More
                        </Button>
                    </CardFooter>
                )}
            </Card>

        </div>
    );
}
