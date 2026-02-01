
'use server';

import { isAdminAuthenticated } from '@/app/actions';
import { User } from '@/lib/definitions';
import { connectToDatabase } from '@/lib/mongodb';
import { unstable_noStore as noStore } from 'next/cache';

const PAGE_SIZE = 10;

export async function getActiveUsers(page: number, search: string, sort: string): Promise<{ users: (User & { lastVisit: Date, orderCount: number })[], hasMore: boolean, totalUsers: number }> {
    noStore();
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
        return { users: [], hasMore: false, totalUsers: 0 };
    }

    try {
        const db = await connectToDatabase();
        const skip = (page - 1) * PAGE_SIZE;

        let query: any = {
            visits: { $exists: true, $not: { $size: 0 } },
            isHidden: { $ne: true },
            isBanned: { $ne: true }
        };

        if (search) {
            query.gamingId = { $regex: search, $options: 'i' };
        }

        const aggregationPipeline: any[] = [
            // Filter for users who have visits and are not hidden/banned
            {
                $match: query
            },
            // Get the last visit date
            {
                $addFields: {
                    lastVisit: { $max: "$visits" }
                }
            },
            // Sort by the most recent visit first
            {
                $sort: { lastVisit: sort === 'asc' ? 1 : -1 }
            },
            // Pagination
            {
                $skip: skip
            },
            {
                $limit: PAGE_SIZE
            },
            // Join with orders collection to get order count
            {
                $lookup: {
                    from: "orders",
                    localField: "gamingId",
                    foreignField: "gamingId",
                    as: "userOrders"
                }
            },
            // Add the order count field
            {
                $addFields: {
                    orderCount: { $size: "$userOrders" }
                }
            },
            // Clean up the output
            {
                $project: {
                    userOrders: 0, // Exclude the large orders array
                }
            }
        ];
        
        const users = await db.collection('users').aggregate(aggregationPipeline).toArray();
        const totalUsers = await db.collection('users').countDocuments(query);

        const hasMore = (skip + users.length) < totalUsers;

        return { users: JSON.parse(JSON.stringify(users)), hasMore, totalUsers };

    } catch (error) {
        console.error("Error fetching active users:", error);
        return { users: [], hasMore: false, totalUsers: 0 };
    }
}
