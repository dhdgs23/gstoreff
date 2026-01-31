
'use server';

import { isAdminAuthenticated } from '@/app/actions';
import { connectToDatabase } from '@/lib/mongodb';
import { type AiLog } from '@/lib/definitions';
import { unstable_noStore as noStore } from 'next/cache';

export async function getAllAiLogsForDownload(): Promise<{ success: boolean; message?: string; data?: AiLog[] }> {
    noStore();
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
        return { success: false, message: 'Unauthorized' };
    }

    try {
        const db = await connectToDatabase();
        const logs = await db.collection<AiLog>('ai_logs')
            .find({})
            .sort({ createdAt: -1 }) // Newest first
            .toArray();

        return { success: true, data: JSON.parse(JSON.stringify(logs)) };

    } catch (error) {
        console.error('Error fetching all AI logs for download:', error);
        return { success: false, message: 'An unexpected error occurred while fetching data.' };
    }
}
