import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import NotificationModule from './notification.module';
import PostsModule from './post.module';
import CommentsService from '../services/comment.service';
import CommentsController from '../controllers/comment.controller';
import { CommentSchema } from '../schemas/comment.schema';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import * as dotenv from 'dotenv'

dotenv.config()
@Module({
  imports: [
    NotificationModule,
    forwardRef(() => PostsModule),
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
    RabbitMQModule.forRoot(RabbitMQModule, {
        exchanges: [
            {
                name: 'healthline.user.information',
                type: 'direct'
            }
        ],
        uri: process.env.RABBITMQ_URL,
        connectionInitOptions: { wait: false, reject: true, timeout: 10000 },
        enableControllerDiscovery: true
    }),
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [MongooseModule, CommentsService],
})
export default class CommentsModule {}