import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import NotificationModule from './notification.module';
import { PostSchema } from '../schemas/post.schema';
import { PostsService } from '../services/post.service';
import { CommentSchema } from '../schemas/comment.schema';
import PostsController from '../controllers/post.controller';
@Module({
  imports: [
    NotificationModule,
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
    MongooseModule.forFeatureAsync([
      {
        name: 'Post',
        useFactory: (postsService: PostsService) => {
          const schema = PostSchema;
          schema.post('deleteOne', (post) => {
            postsService.cascadeDeleteComments(post._id);
          });
          return schema;
        },
      },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [MongooseModule, PostsService],
})
export default class PostsModule {}