import mongoose, { Schema, type Document } from 'mongoose';

export interface ILocation extends Document {
  name: string;
  rooms: number;
  createdAt: Date;
}

const locationSchema = new Schema<ILocation>({
  name: { type: String, required: true, unique: true },
  rooms: { type: Number, default: 0 },
}, { timestamps: true });

export const Location = mongoose.model<ILocation>('Location', locationSchema);
