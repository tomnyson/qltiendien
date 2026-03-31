import mongoose, { Schema, type Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  createdAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  description: String,
}, { timestamps: true });

export const Category = mongoose.model<ICategory>('Category', categorySchema);
