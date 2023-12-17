import { Module } from '@nestjs/common';
import NotificationModule from './modules/notification.module';
import PostsModule from './modules/post.module';
import CommentsModule from './modules/comment.module';
import { CommentsGateway } from './controllers/comment.gateway';
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";

@Module({
  imports: [
		PostsModule,
		CommentsModule,
		NotificationModule,
  ],
  controllers: [],
  providers: [CommentsGateway],
})
export class ForumModule {}
