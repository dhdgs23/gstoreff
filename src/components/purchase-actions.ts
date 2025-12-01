
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { PaymentLock } from '@/lib/definitions';
import { ObjectId } from 'mongodb';

const LOCK_TTL_MS = 90 * 1000; // 90 seconds

/**
 * Creates a payment lock for a user and a specific amount.
 * Returns an error if a lock for the same amount already exists.
 */
export async function createPaymentLock(gamingId: string, productId: string, productName: string, amount: number): Promise<{ success: boolean; lockId?: string; message?: string }> {
  try {
    const db = await connectToDatabase();

    // Check for an existing active lock for the same amount
    const existingLock = await db.collection<PaymentLock>('payment_locks').findOne({ amount, status: 'active' });
    if (existingLock) {
      return { success: false, message: 'Another payment for the same amount is in progress. Please wait.' };
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + LOCK_TTL_MS);

    const newLock: Omit<PaymentLock, '_id'> = {
      gamingId,
      productId,
      productName,
      amount,
      status: 'active',
      createdAt: now,
      expiresAt,
    };

    const result = await db.collection('payment_locks').insertOne(newLock as PaymentLock);
    return { success: true, lockId: result.insertedId.toString() };

  } catch (error) {
    console.error('Error creating payment lock:', error);
    return { success: false, message: 'An internal error occurred.' };
  }
}

/**
 * Releases a payment lock, marking it as 'expired'.
 * This is called when the user closes the modal or the timer runs out.
 */
export async function releasePaymentLock(lockId: string): Promise<{ success: boolean }> {
  try {
    const db = await connectToDatabase();
    await db.collection<PaymentLock>('payment_locks').updateOne(
      { _id: new ObjectId(lockId), status: 'active' }, // Only expire active locks
      { $set: { status: 'expired', expiresAt: new Date() } } // Update expiresAt to now
    );
    return { success: true };
  } catch (error) {
    console.error('Error releasing payment lock:', error);
    return { success: false };
  }
}

/**
 * Checks if the payment associated with a lock has been completed.
 */
export async function checkPaymentStatus(lockId: string): Promise<{ isCompleted: boolean }> {
    if (!lockId) return { isCompleted: false };
    try {
        const db = await connectToDatabase();
        const lock = await db.collection<PaymentLock>('payment_locks').findOne({ _id: new ObjectId(lockId) });
        return { isCompleted: lock?.status === 'completed' };
    } catch (error) {
        console.error('Error checking payment status:', error);
        return { isCompleted: false };
    }
}
