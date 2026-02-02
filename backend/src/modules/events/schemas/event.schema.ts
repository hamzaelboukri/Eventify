import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EventStatus } from '../../../common/enums/event-status.enum';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true, min: 1 })
  capacity: number;

  @Prop({ default: 0 })
  reservedCount: number;

  @Prop({
    type: String,
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop()
  imageUrl?: string;

  @Prop()
  category?: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Virtual for available places
EventSchema.virtual('availablePlaces').get(function () {
  return this.capacity - this.reservedCount;
});

// Virtual to check if event is full
EventSchema.virtual('isFull').get(function () {
  return this.reservedCount >= this.capacity;
});

// Ensure virtuals are included in JSON
EventSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    const obj = { ...ret };
    delete (obj as { __v?: number }).__v;
    return obj;
  },
});

// Index for searching and filtering
EventSchema.index({ title: 'text', description: 'text' });
EventSchema.index({ status: 1, date: 1 });
