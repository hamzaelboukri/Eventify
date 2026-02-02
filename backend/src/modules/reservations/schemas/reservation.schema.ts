import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReservationStatus } from '../../../common/enums/reservation-status.enum';

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  event: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  participant: Types.ObjectId;

  @Prop({
    type: String,
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Prop()
  ticketNumber?: string;

  @Prop()
  notes?: string;

  @Prop()
  confirmedAt?: Date;

  @Prop()
  canceledAt?: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

// Compound index to ensure one active reservation per user per event
ReservationSchema.index(
  { event: 1, participant: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'confirmed'] },
    },
  },
);

// Index for querying
ReservationSchema.index({ participant: 1, status: 1 });
ReservationSchema.index({ event: 1, status: 1 });

// Ensure virtuals are included in JSON
ReservationSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    const obj = { ...ret };
    delete (obj as { __v?: number }).__v;
    return obj;
  },
});
