import { Module } from '@nestjs/common';
import NotificationModule from './modules/notification.module';
import PostsModule from './modules/post.module';
import CommentsModule from './modules/comment.module';
import { CommentsGateway } from './gateways/comment.gateway';
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { NotificationsGateway } from './gateways/notification.gateway';

@Module({
  imports: [
		PostsModule,
		CommentsModule,
		NotificationModule,
  ],
  controllers: [],
  providers: [CommentsGateway, NotificationsGateway],
})
export class ForumModule {}
