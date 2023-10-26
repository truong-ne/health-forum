import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from '../schemas/post.schema';
import CommentsService from '../services/comment.service';
import { PostsService } from '../services/post.service';
import CommentsModule from './comment.module';
import NotificationModule from './notification.module';
import { PhotosModule } from './photo.module';

@Module({
  imports: [
    PhotosModule,
    NotificationModule,
    MongooseModule.forFeatureAsync([
      {
        name: 'Post',
        imports: [CommentsModule],
        useFactory: (commentsService: CommentsService) => {
          const schema = PostSchema;
          schema.post('deleteOne', (post) => {
            commentsService.cascadeDeleteComments(post._id);
          });
          return schema;
        },
        inject: [CommentsService],
      },
    ]),
  ],
  controllers: [],
  providers: [PostsService],
  exports: [MongooseModule, PostsService],
})
export default class PostsModule {}