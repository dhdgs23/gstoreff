'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';
import { getAiLogs } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { type AiLog } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

    const search = searchParams.get('search') || '';

    useEffect(() => {
        setLogs(initialLogs);
        setHasMore(initialHasMore);
        setPage(1);
    }, [initialLogs, initialHasMore]);

    const handleLoadMore = async () => {
        startTransition(async () => {
            const nextPage = page + 1;
            const { logs: newLogs, hasMore: newHasMore } = await getAiLogs(nextPage, search);
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

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                         <div className="flex items-center gap-2">
                           <CardTitle>AI Conversation Logs</CardTitle>
                           <Badge variant="secondary" className="text-sm">{totalLogs}</Badge>
                        </div>
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <Input name="search" placeholder="Search by Gaming ID..." defaultValue={search} className="w-56"/>
                            <Button type="submit" variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
                        </form>
                    </div>
                     <CardDescription>View the conversations users are having with the FAQ chatbot.</CardDescription>
                </CardHeader>
                <CardContent>
                    {logs.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No AI logs to display.</p>
                    ) : (
                        <div className="space-y-4">
                            {logs.map(log => (
                                <Card key={log._id.toString()} className="overflow-hidden">
                                    <CardHeader className="flex flex-row justify-between items-start bg-muted/50 p-4">
                                        <div>
                                            <CardTitle className="text-base font-mono">{log.gamingId}</CardTitle>
                                            <CardDescription className="text-xs mt-1">
                                                <FormattedDate dateString={log.createdAt as unknown as string} />
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                       <Accordion type="single" collapsible className="w-full">
                                          <AccordionItem value="item-1">
                                            <AccordionTrigger className="text-left"><strong>User's Question:</strong> {log.question}</AccordionTrigger>
                                            <AccordionContent>
                                              <div className="prose prose-sm max-w-none text-foreground p-4 bg-muted rounded-md">
                                                <p><strong>AI's Answer:</strong></p>
                                                <p>{log.answer}</p>
                                              </div>
                                            </AccordionContent>
                                          </AccordionItem>
                                        </Accordion>
                                    </CardContent>
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
