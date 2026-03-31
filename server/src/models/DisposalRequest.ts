import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IDisposalRequest extends Document {
  equipment: Types.ObjectId;
  equipmentName: string;
  equipmentCode: string;
  reason: string;
  originalValue: number;
  residualValue: number;
  status: 'pending' | 'approved' | 'completed';
  approvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const disposalRequestSchema = new Schema<IDisposalRequest>({
  equipment: { type: Schema.Types.ObjectId, ref: 'Equipment' },
  equipmentName: { type: String, required: true },
  equipmentCode: { type: String, required: true },
  reason: { type: String, required: true },
  originalValue: { type: Number, required: true },
  residualValue: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed'],
    default: 'pending',
  },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const DisposalRequest = mongoose.model<IDisposalRequest>('DisposalRequest', disposalRequestSchema);
