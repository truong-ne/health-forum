import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Room } from './room.schema';

export type MessageType = Message & Document;

@Schema({ timestamps: true, validateBeforeSave: true })
export class Message {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true })
    room_id: string;

    @Prop({ required: true })
    sender_id: string

    @Prop({ required: true })
	text: string;

    @Prop({ default: 'text' })
    type: string

    @Prop({ default: false })
    isDelete: boolean

	@Prop()
	createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);