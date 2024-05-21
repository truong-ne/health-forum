import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ForumModule } from './forum/forum.module';
import * as dotenv from 'dotenv'
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { redisClientOption } from './config/database.config';
import OtpModule from './otp/otp.module';
import BlogsModule from './blog/blog.module';
import ChatModule from './chat/chat.module';

dotenv.config()
@Module({
  imports: [
    ConfigModule.forRoot(),
		MongooseModule.forRoot(process.env.MONGO_URI),
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      ...redisClientOption
    }),
    AuthModule,
    ForumModule,
    OtpModule,
    BlogsModule,
    ChatModule
  ],
})
export class AppModule {}
