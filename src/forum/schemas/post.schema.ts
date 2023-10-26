import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type PostType = Post & Document;

@Schema({ timestamps: true, validateBeforeSave: true })
export class Post {
  @Prop()
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' })
  photo: string;

  @Prop({ required: true })
  user: string;

  @Prop({
    default: [],
  })
  likes: string[];

  @Prop()
  shares: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);