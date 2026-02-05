import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELED = 'canceled',
}

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  location: string;

  @Prop()
  image: string;

  @Prop({ default: 'General' })
  category: string;

  @Prop({ required: true, min: 1 })
  capacity: number;

  @Prop({ default: 0 })
  reservedSpots: number;

  @Prop({
    type: String,
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  organizer: Types.ObjectId;

  @Prop()
  price: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Virtual field for available spots
EventSchema.virtual('availableSpots').get(function () {
  return this.capacity - this.reservedSpots;
});

// Transform the output
EventSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = ret as any;
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
  },
});

EventSchema.set('toObject', {
  virtuals: true,
});
