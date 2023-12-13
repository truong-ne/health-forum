import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import NotificationModule from './notification.module';
import { PostSchema } from '../schemas/post.schema';
import { PostsService } from '../services/post.service';
import { CommentSchema } from '../schemas/comment.schema';
import PostsController from '../controllers/post.controller';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PostConsumer } from '../consumers/post.consumer';
@Module({
  imports: [
    NotificationModule,
    RabbitMQModule.forRoot(RabbitMQModule, {
        exchanges: [
            {
                name: 'healthline.user.information',
                type: 'direct'
            },
            {
              name: 'healthline.upload.folder',
              type: 'direct'
            }
        ],
        uri: process.env.RABBITMQ_URL,
        connectionInitOptions: { wait: false, reject: true, timeout: 10000 },
        enableControllerDiscovery: true
    }),
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
  providers: [PostsService, PostConsumer],
  exports: [MongooseModule, PostsService],
})
export default class PostsModule {}