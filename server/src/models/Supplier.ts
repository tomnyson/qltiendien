import mongoose, { Schema, type Document } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  contact: string;
  phone?: string;
  address?: string;
  createdAt: Date;
}

const supplierSchema = new Schema<ISupplier>({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  phone: String,
  address: String,
}, { timestamps: true });

export const Supplier = mongoose.model<ISupplier>('Supplier', supplierSchema);
