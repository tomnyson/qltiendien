import mongoose, { Schema, type Document, type Types } from 'mongoose';

interface IInventoryItem {
  equipment: Types.ObjectId;
  checkedAt?: Date;
  matched: boolean;
  notes?: string;
}

export interface IInventorySession extends Document {
  name: string;
  date: Date;
  location: string;
  totalItems: number;
  checkedItems: number;
  matchedItems: number;
  mismatchedItems: number;
  status: 'in-progress' | 'completed';
  progress: number;
  items: IInventoryItem[];
  createdAt: Date;
}

const inventoryItemSchema = new Schema<IInventoryItem>({
  equipment: { type: Schema.Types.ObjectId, ref: 'Equipment' },
  checkedAt: Date,
  matched: { type: Boolean, default: false },
  notes: String,
}, { _id: false });

const inventorySessionSchema = new Schema<IInventorySession>({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  totalItems: { type: Number, default: 0 },
  checkedItems: { type: Number, default: 0 },
  matchedItems: { type: Number, default: 0 },
  mismatchedItems: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress',
  },
  progress: { type: Number, default: 0 },
  items: [inventoryItemSchema],
}, { timestamps: true });

export const InventorySession = mongoose.model<IInventorySession>('InventorySession', inventorySessionSchema);
