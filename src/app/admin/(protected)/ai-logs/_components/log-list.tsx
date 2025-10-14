
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Search, Trash2, ArrowUpDown } from 'lucide-react';
import { getAiLogs, deleteAiLog } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { type AiLog } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


interface LogListProps {
    initialLogs: AiLog[];
    initialHasMore: boolean;
    totalLogs: number;
}

const FormattedDate = ({ dateString }: { dateString: string }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
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

export default function LogList({ initialLogs, initialHasMore, totalLogs }: LogListProps) {
    const [logs, setLogs] = useState<AiLog[]>(initialLogs);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();


    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'desc';

    useEffect(() => {
        setLogs(initialLogs);
        setHasMore(initialHasMore);
        setPage(1);
    }, [initialLogs, initialHasMore]);

    const handleLoadMore = async () => {
        startTransition(async () => {
            const nextPage = page + 1;
            const { logs: newLogs, hasMore: newHasMore } = await getAiLogs(nextPage, search, sort);
            setLogs(prev => [...prev, ...newLogs]);
            setHasMore(newHasMore);
            setPage(nextPage);
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
    
    const handleSortToggle = () => {
        const newSort = sort === 'desc' ? 'asc' : 'desc';
        const params = new URLSearchParams(searchParams);
        params.set('sort', newSort);
        router.push(`${pathname}?${params.toString()}`);
    };
    
    const handleDelete = async (logId: string) => {
        startTransition(async () => {
            const result = await deleteAiLog(logId);
            if (result.success) {
                setLogs(prev => prev.filter(log => log._id.toString() !== logId));
                toast({ title: 'Success', description: result.message });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.message });
            }
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                         <div className="flex items-center gap-2">
                           <CardTitle>AI Conversation Logs</CardTitle>
                           <Badge variant="secondary" className="text-sm">{totalLogs} Messages</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <form onSubmit={handleSearch} className="flex items-center gap-2">
                                <Input name="search" placeholder="Search by Gaming ID..." defaultValue={search} className="w-56"/>
                                <Button type="submit" variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
                            </form>
                            <Button variant="outline" onClick={handleSortToggle}>
                                <ArrowUpDown className="mr-2 h-4 w-4" />
                                {sort === 'desc' ? 'Newest First' : 'Oldest First'}
                            </Button>
                        </div>
                    </div>
                     <CardDescription>View the conversations users are having with the FAQ chatbot.</CardDescription>
                </CardHeader>
                <CardContent>
                    {logs.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No AI logs to display.</p>
                    ) : (
                       <div className="space-y-4">
                            {logs.map(log => (
                                <Card key={log._id.toString()} className="relative group">
                                     <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm font-mono">{log.gamingId}</CardTitle>
                                            <CardDescription className="text-xs">
                                                <FormattedDate dateString={log.createdAt as unknown as string} />
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                            <p className="font-semibold text-blue-800">User:</p>
                                            <p>{log.question}</p>
                                        </div>
                                        <div className="p-3 mt-2 rounded-lg bg-gray-50 border">
                                            <p className="font-semibold text-gray-800">Assistant:</p>
                                            <p>{log.answer}</p>
                                        </div>
                                    </CardContent>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" className="h-7 w-7">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action will permanently delete this message exchange. This cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(log._id.toString())}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {hasMore && (
                <div className="text-center">
                    <Button onClick={handleLoadMore} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Load More
                    </Button>
                </div>
            )}
        </div>
    );
}
