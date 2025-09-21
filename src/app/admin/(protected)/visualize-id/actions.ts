'use server';

import { isAdminAuthenticated } from '@/app/actions';
import { User } from '@/lib/definitions';
import { connectToDatabase } from '@/lib/mongodb';
import { unstable_noStore as noStore } from 'next/cache';
import { revalidatePath } from 'next/cache';

const PAGE_SIZE = 10;

export async function findUserForVisualId(gamingId: string): Promise<{ success: boolean; message?: string; user?: User; }> {
    noStore();
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { success: false, message: 'Unauthorized' };

    if (!gamingId) return { success: false, message: 'Gaming ID is required.' };

    try {
        const db = await connectToDatabase();
        const user = await db.collection<User>('users').findOne({ gamingId });
        if (!user) {
            return { success: false, message: 'User not found.' };
        }
        return { success: true, user: JSON.parse(JSON.stringify(user)) };
    } catch (error) {
        console.error('Error finding user for visual ID:', error);
        return { success: false, message: 'An error occurred while searching for the user.' };
    }
}

export async function setVisualId(realGamingId: string, visualGamingId: string): Promise<{ success: boolean; message: string }> {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { success: false, message: 'Unauthorized' };

    if (!realGamingId || !visualGamingId) {
        return { success: false, message: 'Both real and visual Gaming IDs are required.' };
    }

    try {
        const db = await connectToDatabase();
        const result = await db.collection<User>('users').updateOne(
            { gamingId: realGamingId },
            { $set: { visualGamingId: visualGamingId, visualIdSetAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return { success: false, message: 'User with the specified real Gaming ID not found.' };
        }

        revalidatePath('/admin/visualize-id');
        return { success: true, message: 'Visual ID has been set successfully.' };
    } catch (error) {
        console.error('Error setting visual ID:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function removeVisualId(realGamingId: string): Promise<{ success: boolean; message: string }> {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { success: false, message: 'Unauthorized' };
    
    if (!realGamingId) {
        return { success: false, message: 'Real Gaming ID is required.' };
    }

    try {
        const db = await connectToDatabase();
        const result = await db.collection<User>('users').updateOne(
            { gamingId: realGamingId },
            { $unset: { visualGamingId: "", visualIdSetAt: "" } }
        );
        
        if (result.matchedCount === 0) {
            return { success: false, message: 'User not found.' };
        }

        revalidatePath('/admin/visualize-id');
        return { success: true, message: 'Visual ID has been removed.' };
    } catch (error) {
        console.error('Error removing visual ID:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}


export async function getVisualizedUsers(page: number, search: string, sort: string) {
    noStore();
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
        return { users: [], hasMore: false, totalUsers: 0 };
    }

    const db = await connectToDatabase();
    const skip = (page - 1) * PAGE_SIZE;

    let query: any = { visualGamingId: { $exists: true, $ne: "" } };
    if (search) {
        query.$or = [
            { gamingId: { $regex: search, $options: 'i' } },
            { visualGamingId: { $regex: search, $options: 'i' } }
        ];
    }
    
    const usersFromDb = await db.collection<User>('users')
      .find(query)
      .sort({ visualIdSetAt: sort === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .toArray();

    const totalUsers = await db.collection('users').countDocuments(query);
    const hasMore = skip + usersFromDb.length < totalUsers;

    const users = JSON.parse(JSON.stringify(usersFromDb));

    return { users, hasMore, totalUsers };
}
