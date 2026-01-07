
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ArrowUpDown, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPromotedIdLogs } from '../actions';
import type { VisualIdPromotionLog } from '@/lib/definitions';
import { Input } from '@/components/ui/input';

interface PromotedIdListProps {
  initialLogs: VisualIdPromotionLog[];
  initialHasMore: boolean;
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

const HighlightedId = ({ oldId, newId }: { oldId: string, newId: string }) => {
  const newIdChars = newId.split('');
  const oldIdChars = oldId.split('');
  
  return (
    <span className="font-mono font-bold text-primary">
      {newIdChars.map((char, index) => {
        if (char !== oldIdChars[index]) {
          return <span key={index} className="text-destructive animate-pulse">{char}</span>;
        }
        return <span key={index}>{char}</span>;
      })}
    </span>
  );
};

export default function PromotedIdList({ initialLogs, initialHasMore }: PromotedIdListProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = searchParams.get('sort') || 'desc';

  useEffect(() => {
    setLogs(initialLogs);
    setHasMore(initialHasMore);
    setPage(1);
  }, [initialLogs, initialHasMore]);

  const handleLoadMore = async () => {
    startTransition(async () => {
      const nextPage = page + 1;
      const search = searchParams.get('search') || '';
      const { logs: newLogs, hasMore: newHasMore } = await getPromotedIdLogs(search, nextPage, sort);
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
        const newSort = sort === 'asc' ? 'desc' : 'asc';
        const params = new URLSearchParams(searchParams);
        params.set('sort', newSort);
        router.push(`${pathname}?${params.toString()}`);
    };


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Promoted ID Logs</CardTitle>
            <CardDescription>
              This is a log of all users whose visual ID was promoted to their real ID upon logout.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                name="search"
                placeholder="Search by any ID..."
                defaultValue={searchParams.get('search') || ''}
                className="w-56"
                />
                <Button type="submit" variant="outline" size="icon">
                <Search className="h-4 w-4" />
                </Button>
            </form>
            <Button variant="outline" onClick={handleSortToggle}>
                <ArrowUpDown className="mr-2 h-4 w-4" />
                {sort === 'desc' ? 'Newest First' : 'Oldest First'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {logs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No promotion logs found.</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <Card key={log._id.toString()} className="p-4 bg-muted/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-4 text-sm sm:text-base">
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Old ID</p>
                            <p className="font-mono font-semibold">{log.oldGamingId}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-primary shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">New ID</p>
                            <HighlightedId oldId={log.oldGamingId} newId={log.newGamingId} />
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground sm:text-right">
                        <p className="text-xs">Promoted On</p>
                        <p><FormattedDate dateString={log.promotionDate as unknown as string} /></p>
                    </div>
                </div>
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
