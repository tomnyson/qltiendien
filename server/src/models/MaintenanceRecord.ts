import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IMaintenanceRecord extends Document {
  equipment: Types.ObjectId;
  equipmentName: string;
  equipmentCode: string;
  type: 'repair' | 'inspection' | 'calibration';
  date: Date;
  cost: number;
  status: 'scheduled' | 'in-progress' | 'completed';
  technician: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceRecordSchema = new Schema<IMaintenanceRecord>({
  equipment: { type: Schema.Types.ObjectId, ref: 'Equipment' },
  equipmentName: { type: String, required: true },
  equipmentCode: { type: String, required: true },
  type: {
    type: String,
    enum: ['repair', 'inspection', 'calibration'],
    required: true,
  },
  date: { type: Date, required: true },
  cost: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed'],
    default: 'scheduled',
  },
  technician: { type: String, required: true },
  notes: String,
}, { timestamps: true });

export const MaintenanceRecord = mongoose.model<IMaintenanceRecord>('MaintenanceRecord', maintenanceRecordSchema);
