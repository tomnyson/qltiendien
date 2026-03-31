import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IEquipment extends Document {
  name: string;
  code: string;
  category: Types.ObjectId;
  location: Types.ObjectId;
  status: 'available' | 'in-use' | 'maintenance' | 'disposed';
  supplier: Types.ObjectId;
  purchaseDate: Date;
  value: number;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const equipmentSchema = new Schema<IEquipment>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, index: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
  status: {
    type: String,
    enum: ['available', 'in-use', 'maintenance', 'disposed'],
    default: 'available',
  },
  supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  purchaseDate: { type: Date, required: true },
  value: { type: Number, required: true },
  assignedTo: String,
}, { timestamps: true });

export const Equipment = mongoose.model<IEquipment>('Equipment', equipmentSchema);
