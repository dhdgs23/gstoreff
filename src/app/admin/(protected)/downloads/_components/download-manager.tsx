
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import Link from 'next/link';

export default function DownloadManager() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Download Center</CardTitle>
                    <CardDescription>Download collections from the database as JSON files.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold">AI Conversation Logs</h3>
                            <p className="text-sm text-muted-foreground">Downloads all user conversations with the AI assistant.</p>
                        </div>
                        <Button asChild>
                            <Link href="/api/download/ai-logs" target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2" />
                                Download All AI Logs
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
