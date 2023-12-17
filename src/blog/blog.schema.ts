import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type BlogType = Blog & Document;

@Schema({ timestamps: true, validateBeforeSave: true })
export class Blog {
  @Prop()
  title: string;

  @Prop()
  tag: string[];

  @Prop()
  content: string;

  @Prop()
  photo: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);