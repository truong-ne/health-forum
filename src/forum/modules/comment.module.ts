import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from '../schemas/comment.schema';
import CommentsService from '../services/comment.service';
import NotificationModule from './notification.module';
import PostsModule from './post.module';

@Module({
  imports: [
    NotificationModule,
    forwardRef(() => PostsModule),
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
  ],
  providers: [CommentsService],
  controllers: [],
  exports: [MongooseModule, CommentsService],
})
export default class CommentsModule {}