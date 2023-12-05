import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from '../services/post.service';
import PostsController from '../controllers/post.controller';
import { BlogSchema } from '../schemas/blog.schema';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { BlogsService } from '../services/blog.service';
import BlogsController from '../controllers/blog.controler';
import { BlogConsumer } from '../consumers/blog.consumer';
@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
        exchanges: [
            {
                name: 'healthline.upload.folder',
                type: 'direct'
            }
        ],
        uri: process.env.RABBITMQ_URL,
        connectionInitOptions: { wait: true, reject: true, timeout: 10000 },
    }),
    MongooseModule.forFeature([{ name: 'Blog', schema: BlogSchema }]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogConsumer],
  exports: [MongooseModule, BlogsService],
})
export default class BlogsModule {}