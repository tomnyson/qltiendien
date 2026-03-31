import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IBorrowRequest extends Document {
  equipment: Types.ObjectId;
  equipmentName: string;
  equipmentCode: string;
  borrower: string;
  borrowDate: Date;
  returnDate: Date;
  actualReturnDate?: Date;
  status: 'pending' | 'approved' | 'returned' | 'overdue' | 'rejected';
  approvedBy?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const borrowRequestSchema = new Schema<IBorrowRequest>({
  equipment: { type: Schema.Types.ObjectId, ref: 'Equipment' },
  equipmentName: { type: String, required: true },
  equipmentCode: { type: String, required: true },
  borrower: { type: String, required: true },
  borrowDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  actualReturnDate: Date,
  status: {
    type: String,
    enum: ['pending', 'approved', 'returned', 'overdue', 'rejected'],
    default: 'pending',
  },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: String,
}, { timestamps: true });

export const BorrowRequest = mongoose.model<IBorrowRequest>('BorrowRequest', borrowRequestSchema);
