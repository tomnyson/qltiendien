import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IAuditLog extends Document {
  user?: Types.ObjectId;
  userName: string;
  action: string;
  detail: string;
  ipAddress?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  detail: { type: String, required: true },
  ipAddress: String,
}, { timestamps: true });

// Auto-cleanup logs older than 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
