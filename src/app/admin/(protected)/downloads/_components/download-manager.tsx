
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllAiLogsForDownload } from '../actions';

export default function DownloadManager() {
    const [isDownloading, startDownloadTransition] = useTransition();
    const { toast } = useToast();

    const handleDownloadAiLogs = () => {
        startDownloadTransition(async () => {
            const result = await getAllAiLogsForDownload();

            if (result.success && result.data) {
                try {
                    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                        JSON.stringify(result.data, null, 2)
                    )}`;
                    const link = document.createElement("a");
                    link.href = jsonString;
                    const date = new Date().toISOString().split('T')[0];
                    link.download = `ai_logs_${date}.json`;
                    link.click();
                    toast({ title: 'Success', description: 'AI logs are downloading.' });
                } catch (error) {
                    toast({ variant: 'destructive', title: 'Error', description: 'Failed to create download file.' });
                }
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.message });
            }
        });
    };

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
                        <Button onClick={handleDownloadAiLogs} disabled={isDownloading}>
                            {isDownloading ? <Loader2 className="mr-2 animate-spin" /> : <Download className="mr-2" />}
                            {isDownloading ? 'Preparing...' : 'Download All AI Logs'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
