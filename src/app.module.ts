import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ForumModule } from './forum/forum.module';
import * as dotenv from 'dotenv'

dotenv.config()
@Module({
  imports: [
    ConfigModule.forRoot(),
		MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    ForumModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
