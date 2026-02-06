import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REFUSED = 'refused',
  CANCELED = 'canceled',
}

@Schema({ timestamps: true })
export class Reservation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  participant: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  event: Types.ObjectId;

  @Prop({ type: String, enum: ReservationStatus, default: ReservationStatus.PENDING })
  status: ReservationStatus;

  @Prop()
  notes?: string;

  @Prop()
  refusedReason?: string;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

// Index for unique reservation per user per event
ReservationSchema.index({ participant: 1, event: 1 }, { unique: true });

ReservationSchema.set('toJSON', {
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
