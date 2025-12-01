
'use server';

import { isAdminAuthenticated } from '@/app/actions';
import { SmsWebhookLog } from '@/lib/definitions';
import { connectToDatabase } from '@/lib/mongodb';
import { unstable_noStore as noStore } from 'next/cache';

const PAGE_SIZE = 20;

export async function getSmsLogs(page: number) {
    noStore();
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
        return { logs: [], hasMore: false, total: 0 };
    }

    try {
        const db = await connectToDatabase();
        const skip = (page - 1) * PAGE_SIZE;

        const logsFromDb = await db.collection<SmsWebhookLog>('sms_webhook_logs')
            .find()
            .sort({ receivedAt: -1 })
            .skip(skip)
            .limit(PAGE_SIZE)
            .toArray();

        const total = await db.collection('sms_webhook_logs').countDocuments();
        const hasMore = skip + logsFromDb.length < total;

        const logs = JSON.parse(JSON.stringify(logsFromDb));

        return { logs, hasMore, total };

    } catch (error) {
        console.error("Error fetching SMS logs:", error);
        return { logs: [], hasMore: false, total: 0 };
    }
}
