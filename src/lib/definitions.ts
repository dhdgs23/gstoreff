import { type ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  username: string;
  password:  string;
  referralCode?: string;
  referredBy?: string;
}
