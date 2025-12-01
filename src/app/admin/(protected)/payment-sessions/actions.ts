
'use server';

import { isAdminAuthenticated } from '@/app/actions';
import { PaymentLock } from '@/lib/definitions';
import { connectToDatabase } from '@/lib/mongodb';
import { unstable_noStore as noStore } from 'next/cache';

const PAGE_SIZE = 10;

export async function getPaymentSessions(page: number, search: string) {
    noStore();
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
        return { sessions: [], hasMore: false, total: 0 };
    }

    try {
        const db = await connectToDatabase();
        const skip = (page - 1) * PAGE_SIZE;

        let query: any = {};
        if (search) {
            query.$or = [
                { gamingId: { $regex: search, $options: 'i' } },
                { productName: { $regex: search, $options: 'i' } }
            ]
        }
        
        const sessionsFromDb = await db.collection<PaymentLock>('payment_locks')
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(PAGE_SIZE)
            .toArray();

        const total = await db.collection('payment_locks').countDocuments(query);
        const hasMore = skip + sessionsFromDb.length < total;

        const sessions = JSON.parse(JSON.stringify(sessionsFromDb));

        return { sessions, hasMore, total };

    } catch (error) {
        console.error("Error fetching payment sessions:", error);
        return { sessions: [], hasMore: false, total: 0 };
    }
}
