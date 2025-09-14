
import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { connectToDatabase } from '@/lib/mongodb';
import { type Product, type User, type Order, type LegacyUser } from '@/lib/definitions';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not set.');
    return NextResponse.json({ success: false, message: 'Webhook secret not configured.' }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!signature) {
    return NextResponse.json({ success: false, message: 'Signature missing.' }, { status: 400 });
  }

  // 1. Verify the webhook signature
  let expectedSignature;
  try {
      // For standard payment links and invoices
      if (req.url.includes('?invoice_id=')) {
          expectedSignature = createHmac('sha256', WEBHOOK_SECRET)
              .update(body)
              .digest('hex');
      } else {
          // This path might be needed for standard checkout, keeping for robustness
          const payloadString = JSON.stringify(JSON.parse(body));
           expectedSignature = createHmac('sha256', WEBHOOK_SECRET)
            .update(payloadString)
            .digest('hex');
      }

  } catch(err) {
      expectedSignature = createHmac('sha256', WEBHOOK_SECRET)
            .update(body)
            .digest('hex');
  }


  if (expectedSignature !== signature) {
    // This can happen with invoice webhooks, they don't seem to stringify the body
    // Let's try matching against the raw body for invoice payments
     const rawBodySignature = createHmac('sha256', WEBHOOK_SECRET)
        .update(body)
        .digest('hex');
    if (rawBodySignature !== signature) {
        return NextResponse.json({ success: false, message: 'Invalid signature.' }, { status: 400 });
    }
  }


  const payload = JSON.parse(body);

  // 2. Handle the correct payment event (payment_link.paid or invoice.paid)
  if (payload.event === 'payment.captured' || payload.event === 'invoice.paid') {
    const paymentEntity = payload.payload.payment.entity;
    const invoiceEntity = payload.payload.invoice.entity;

    const { id: razorpayPaymentId } = paymentEntity;
    const { gamingId, productId } = invoiceEntity.notes || paymentEntity.notes;

    if (!productId || !gamingId) {
      console.error('Webhook payload missing productId or gamingId in notes');
      return NextResponse.json({ success: false, message: 'Missing required notes.' }, { status: 400 });
    }
    
    const db = await connectToDatabase();
    
    // 3. Check if order already exists to prevent duplicates
    const existingOrder = await db.collection<Order>('orders').findOne({ utr: razorpayPaymentId });
    if (existingOrder) {
        return NextResponse.json({ success: true, message: 'Order already processed.' });
    }

    const product = await db.collection<Product>('products').findOne({ _id: new ObjectId(productId) });
    const user = await db.collection<User>('users').findOne({ gamingId });

    if (!product || !user) {
        console.error(`Product or user not found for productId: ${productId}, gamingId: ${gamingId}`);
        return NextResponse.json({ success: false, message: 'Product or user not found.' }, { status: 404 });
    }

    const coinsUsed = product.isCoinProduct ? 0 : Math.min(user.coins, product.coinsApplicable || 0);
    const finalPrice = product.isCoinProduct ? product.purchasePrice || product.price : product.price - coinsUsed;
    const orderStatus = product.isCoinProduct ? 'Completed' : 'Processing';

    const newOrder: Omit<Order, '_id'> = {
        userId: user._id.toString(),
        gamingId,
        productId: product._id.toString(),
        productName: product.name,
        productPrice: product.price,
        productImageUrl: product.imageUrl,
        paymentMethod: 'UPI',
        status: orderStatus,
        utr: razorpayPaymentId, // Storing payment ID
        referralCode: user.referredByCode,
        coinsUsed,
        finalPrice,
        isCoinProduct: product.isCoinProduct,
        createdAt: new Date(),
        coinsAtTimeOfPurchase: user.coins,
    };
    
    try {
        const session = db.client.startSession();
        await session.withTransaction(async () => {
            await db.collection<Order>('orders').insertOne(newOrder as Order, { session });

            if (product.isCoinProduct) {
                await db.collection<User>('users').updateOne(
                    { _id: user._id },
                    { $inc: { coins: product.quantity } },
                    { session }
                );
            } else if (coinsUsed > 0) {
                await db.collection<User>('users').updateOne(
                    { _id: user._id },
                    { $inc: { coins: -coinsUsed } },
                    { session }
                );
            }
            
            if (orderStatus === 'Completed' && user.referredByCode) {
                 const rewardAmount = finalPrice * 0.50;
                 await db.collection<LegacyUser>('legacy_users').updateOne(
                    { referralCode: user.referredByCode },
                    { $inc: { walletBalance: rewardAmount } },
                    { session }
                );
            }
        });
        await session.endSession();
        
        // Revalidate paths to update frontend caches
        revalidatePath('/');
        revalidatePath('/order');
        revalidatePath('/admin');

    } catch (error) {
        console.error('Error processing webhook and creating order:', error);
        return NextResponse.json({ success: false, message: 'Database transaction failed.' }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, message: 'Webhook received.' });
}
