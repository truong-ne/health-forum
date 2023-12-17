import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ScheduleModule } from '@nestjs/schedule';
import BlogsController from './blog.controler';
import { BlogSchema } from './blog.schema';
import { BlogConsumer } from './blog.consumer';
import { BlogsService } from './blog.service';
import { BlogsServiceImpl } from './blog.service.impl';

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
    ScheduleModule.forRoot(),
  ],
  controllers: [BlogsController],
  providers: [{
    provide: BlogsService,
    useClass: BlogsServiceImpl
  }, BlogConsumer],
  exports: [{
    provide: BlogsService,
    useClass: BlogsServiceImpl
  }, MongooseModule],
})
export default class BlogsModule {}