import { Module } from '@nestjs/common';
import NotificationModule from './modules/notification.module';
import PostsModule from './modules/post.module';
import CommentsModule from './modules/comment.module';
import { EventsGateway } from './controllers/event.gateway';
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import BlogsModule from './modules/blog.module';
@Module({
  imports: [
		PostsModule,
		CommentsModule,
		NotificationModule,
    BlogsModule
  ],
  controllers: [],
  providers: [EventsGateway],
})
export class ForumModule {}
